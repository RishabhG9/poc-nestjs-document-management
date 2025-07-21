import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import { DocumentService } from '../../../src/modules/document/document.service';
import { Document } from '../../../src/modules/document/document.entity';
import { createMockDocument, createMockUser, createMockRepository } from '../../common/mocks';

describe('DocumentService', () => {
  let service: DocumentService;
  let repository: ReturnType<typeof createMockRepository>;

  const mockUser = createMockUser();
  const mockDocument = createMockDocument({ uploadedBy: mockUser });

  beforeEach(async () => {
    const mockRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    repository = module.get(getRepositoryToken(Document));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a document', async () => {
      const fileData = {
        filename: 'test.pdf',
        mimetype: 'application/pdf',
        url: 'https://example.com/test.pdf',
        uploadedBy: mockUser,
      };

      repository.create.mockReturnValue(mockDocument);
      repository.save.mockResolvedValue(mockDocument);

      const result = await service.save(fileData);

      expect(repository.create).toHaveBeenCalledWith(fileData);
      expect(repository.save).toHaveBeenCalledWith(mockDocument);
      expect(result).toEqual(mockDocument);
    });
  });

  describe('findAll', () => {
    it('should return paginated documents without filters', async () => {
      const documents = [mockDocument];
      repository.findAndCount.mockResolvedValue([documents, 1]);

      const result = await service.findAll(1, 10);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { archived: IsNull() },
        relations: ['uploadedBy'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ data: documents, total: 1 });
    });

    it('should return paginated documents with search filter', async () => {
      const documents = [mockDocument];
      repository.findAndCount.mockResolvedValue([documents, 1]);

      const result = await service.findAll(1, 10, 'test');

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          archived: IsNull(),
          filename: ILike('%test%'),
        },
        relations: ['uploadedBy'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ data: documents, total: 1 });
    });

    it('should return paginated documents with uploadedBy filter', async () => {
      const documents = [mockDocument];
      repository.findAndCount.mockResolvedValue([documents, 1]);

      const result = await service.findAll(1, 10, undefined, 1);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          archived: IsNull(),
          uploadedBy: { id: 1 },
        },
        relations: ['uploadedBy'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ data: documents, total: 1 });
    });
  });

  describe('findOne', () => {
    it('should find document by id', async () => {
      repository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['uploadedBy'],
      });
      expect(result).toEqual(mockDocument);
    });

    it('should return null if document not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['uploadedBy'],
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should soft delete document', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.delete(1, mockDocument);

      expect(repository.update).toHaveBeenCalledWith(1, {
        archived: expect.any(Date),
      });
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw BadRequestException if document already archived', async () => {
      const archivedDocument = createMockDocument({ archived: new Date() });

      await expect(service.delete(1, archivedDocument)).rejects.toThrow(
        new BadRequestException('Document already Deleted'),
      );

      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('updateFilename', () => {
    it('should update document filename', async () => {
      const updatedDocument = createMockDocument({ filename: 'updated.pdf' });

      repository.findOne.mockResolvedValue(mockDocument);
      repository.save.mockResolvedValue(updatedDocument);

      const result = await service.updateFilename(1, 'updated.pdf');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['uploadedBy'],
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockDocument,
        filename: 'updated.pdf',
      });
      expect(result).toEqual(updatedDocument);
    });

    it('should return null if document not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.updateFilename(999, 'updated.pdf');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['uploadedBy'],
      });
      expect(repository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});