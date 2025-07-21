import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from '../../../src/modules/ingestion/ingestion.controller';
import { IngestionService } from '../../../src/modules/ingestion/ingestion.service';
import { TriggerIngestionDto, IngestionStatusDto } from '../../../src/modules/ingestion/dto/ingestion.dto';
import { IngestionStatus } from '../../../src/modules/ingestion/ingestion.entity';
import { UserRole } from '../../../src/modules/users/users.entity';
import { createMockIngestion, createMockDocument, createMockUser } from '../../common/mocks';

describe('IngestionController', () => {
  let controller: IngestionController;
  let ingestionService: jest.Mocked<IngestionService>;

  const mockUser = createMockUser({ role: UserRole.ADMIN });
  const mockDocument = createMockDocument();
  const mockIngestion = createMockIngestion({ document: mockDocument, triggeredBy: mockUser });

  const mockRequest = {
    user: {
      sub: 1,
    },
  };

  beforeEach(async () => {
    const mockIngestionService = {
      triggerIngestion: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      updateStatus: jest.fn(),
      cancelIngestion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: mockIngestionService,
        },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    ingestionService = module.get(IngestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerIngestion', () => {
    it('should trigger ingestion successfully', async () => {
      const triggerDto: TriggerIngestionDto = {
        documentId: 1,
      };

      ingestionService.triggerIngestion.mockResolvedValue(mockIngestion);

      const result = await controller.triggerIngestion(triggerDto, mockRequest);

      expect(ingestionService.triggerIngestion).toHaveBeenCalledWith(triggerDto, 1);
      expect(result).toEqual(mockIngestion);
    });
  });

  describe('listIngestions', () => {
    it('should return paginated ingestions', async () => {
      const expectedResult = { data: [mockIngestion], total: 1 };
      ingestionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.listIngestions(1, 10, IngestionStatus.PENDING);

      expect(ingestionService.findAll).toHaveBeenCalledWith(1, 10, IngestionStatus.PENDING);
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated ingestions with default parameters', async () => {
      const expectedResult = { data: [mockIngestion], total: 1 };
      ingestionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.listIngestions();

      expect(ingestionService.findAll).toHaveBeenCalledWith(1, 10, undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getIngestion', () => {
    it('should return ingestion by id', async () => {
      ingestionService.findOne.mockResolvedValue(mockIngestion);

      const result = await controller.getIngestion(1);

      expect(ingestionService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockIngestion);
    });
  });

  describe('updateStatus', () => {
    it('should update ingestion status', async () => {
      const updateDto: IngestionStatusDto = {
        status: IngestionStatus.PROCESSING,
        progress: 50,
      };

      const updatedIngestion = createMockIngestion({ ...updateDto });
      ingestionService.updateStatus.mockResolvedValue(updatedIngestion);

      const result = await controller.updateStatus(1, updateDto);

      expect(ingestionService.updateStatus).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedIngestion);
    });
  });

  describe('cancelIngestion', () => {
    it('should cancel ingestion', async () => {
      const cancelledIngestion = createMockIngestion({
        status: IngestionStatus.FAILED,
        errorMessage: 'Cancelled by user',
      });

      ingestionService.cancelIngestion.mockResolvedValue(cancelledIngestion);

      const result = await controller.cancelIngestion(1);

      expect(ingestionService.cancelIngestion).toHaveBeenCalledWith(1);
      expect(result).toEqual(cancelledIngestion);
    });
  });
});