import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { IngestionService } from '../../../src/modules/ingestion/ingestion.service';
import { Ingestion, IngestionStatus } from '../../../src/modules/ingestion/ingestion.entity';
import { DocumentService } from '../../../src/modules/document/document.service';
import { TriggerIngestionDto, IngestionStatusDto } from '../../../src/modules/ingestion/dto/ingestion.dto';
import { createMockIngestion, createMockDocument, createMockUser, createMockRepository } from '../../common/mocks';

describe('IngestionService', () => {
  let service: IngestionService;
  let repository: ReturnType<typeof createMockRepository>;
  let documentService: jest.Mocked<DocumentService>;

  const mockUser = createMockUser();
  const mockDocument = createMockDocument();
  const mockIngestion = createMockIngestion({ document: mockDocument, triggeredBy: mockUser });

  beforeEach(async () => {
    const mockRepository = createMockRepository<Ingestion>();
    const mockDocumentService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: getRepositoryToken(Ingestion),
          useValue: mockRepository,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    repository = module.get(getRepositoryToken(Ingestion));
    documentService = module.get(DocumentService);

    // Mock the private method
    jest.spyOn(service as any, 'simulateIngestionProcess').mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerIngestion', () => {
    const triggerDto: TriggerIngestionDto = {
      documentId: 1,
    };

    it('should trigger ingestion successfully', async () => {
      documentService.findOne.mockResolvedValue(mockDocument);
      repository.create.mockReturnValue(mockIngestion);
      repository.save.mockResolvedValue(mockIngestion);

      const result = await service.triggerIngestion(triggerDto, 1);

      expect(documentService.findOne).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalledWith({
        document: mockDocument,
        triggeredBy: { id: 1 },
        status: IngestionStatus.PENDING,
        progress: 0,
      });
      expect(repository.save).toHaveBeenCalledWith(mockIngestion);
      expect(result).toEqual(mockIngestion);
    });

    it('should throw NotFoundException if document not found', async () => {
      documentService.findOne.mockResolvedValue(null);

      await expect(service.triggerIngestion(triggerDto, 1)).rejects.toThrow(
        new NotFoundException('Document not found'),
      );

      expect(documentService.findOne).toHaveBeenCalledWith(1);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated ingestions without status filter', async () => {
      const ingestions = [mockIngestion];
      repository.findAndCount.mockResolvedValue([ingestions, 1]);

      const result = await service.findAll(1, 10);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { archived: IsNull() },
        relations: ['document', 'triggeredBy'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ data: ingestions, total: 1 });
    });

    it('should return paginated ingestions with status filter', async () => {
      const ingestions = [mockIngestion];
      repository.findAndCount.mockResolvedValue([ingestions, 1]);

      const result = await service.findAll(1, 10, IngestionStatus.PENDING);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          archived: IsNull(),
          status: IngestionStatus.PENDING,
        },
        relations: ['document', 'triggeredBy'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ data: ingestions, total: 1 });
    });
  });

  describe('findOne', () => {
    it('should find ingestion by id', async () => {
      repository.findOne.mockResolvedValue(mockIngestion);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['document', 'triggeredBy'],
      });
      expect(result).toEqual(mockIngestion);
    });

    it('should throw NotFoundException if ingestion not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Ingestion Data not found'),
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['document', 'triggeredBy'],
      });
    });
  });

  describe('updateStatus', () => {
    const updateDto: IngestionStatusDto = {
      status: IngestionStatus.PROCESSING,
      progress: 50,
    };

    it('should update ingestion status', async () => {
      const updatedIngestion = createMockIngestion({ ...updateDto });

      repository.findOne.mockResolvedValue(mockIngestion);
      repository.save.mockResolvedValue(updatedIngestion);

      const result = await service.updateStatus(1, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockIngestion,
        ...updateDto,
      });
      expect(result).toEqual(updatedIngestion);
    });

    it('should throw NotFoundException if ingestion not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus(999, updateDto)).rejects.toThrow(
        new NotFoundException('Ingestion not found'),
      );

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('cancelIngestion', () => {
    it('should cancel ingestion', async () => {
      const cancelledIngestion = createMockIngestion({
        status: IngestionStatus.FAILED,
        errorMessage: 'Cancelled by user',
      });

      repository.findOne.mockResolvedValue(mockIngestion);
      repository.save.mockResolvedValue(cancelledIngestion);

      const result = await service.cancelIngestion(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockIngestion,
        status: IngestionStatus.FAILED,
        errorMessage: 'Cancelled by user',
      });
      expect(result).toEqual(cancelledIngestion);
    });
  });
});