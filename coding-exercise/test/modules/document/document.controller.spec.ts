import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DocumentController } from '../../../src/modules/document/document.controller';
import { DocumentService } from '../../../src/modules/document/document.service';
import { UpdateFilenameDto } from '../../../src/modules/document/dto/update-fileName.dto';
import { UserRole } from '../../../src/modules/users/users.entity';
import { createMockDocument, createMockUser } from '../../common/mocks';

// Mock cloudinary
jest.mock('../../../src/config/cloudinary.config', () => ({
  uploader: {
    upload_stream: jest.fn(),
  },
}));

describe('DocumentController', () => {
  let controller: DocumentController;
  let documentService: jest.Mocked<DocumentService>;

  const mockUser = createMockUser({ role: UserRole.ADMIN });
  const mockDocument = createMockDocument({ uploadedBy: mockUser });

  const mockRequest = {
    user: {
      sub: 1,
      role: 'admin',
    },
  };

  beforeEach(async () => {
    const mockDocumentService = {
      save: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      updateFilename: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    documentService = module.get(DocumentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listAll', () => {
    it('should return paginated documents for admin', async () => {
      const expectedResult = { data: [mockDocument], total: 1 };
      documentService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.listAll(1, 10, 'search', mockRequest);

      expect(documentService.findAll).toHaveBeenCalledWith(1, 10, 'search');
      expect(result).toEqual(expectedResult);
    });

    it('should return user-specific documents for non-admin', async () => {
      const nonAdminRequest = {
        user: {
          sub: 1,
          role: 'viewer',
        },
      };

      const expectedResult = { data: [mockDocument], total: 1 };
      documentService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.listAll(1, 10, 'search', nonAdminRequest);

      expect(documentService.findAll).toHaveBeenCalledWith(1, 10, 'search', 1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('delete', () => {
    it('should delete document successfully', async () => {
      documentService.findOne.mockResolvedValue(mockDocument);
      documentService.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.delete(1);

      expect(documentService.findOne).toHaveBeenCalledWith(1);
      expect(documentService.delete).toHaveBeenCalledWith(1, mockDocument);
      expect(result).toEqual({ message: 'Deleted successfully' });
    });

    it('should throw HttpException if document not found', async () => {
      documentService.findOne.mockResolvedValue(null);

      await expect(controller.delete(1)).rejects.toThrow(
        new HttpException('Document not found', HttpStatus.NOT_FOUND),
      );

      expect(documentService.findOne).toHaveBeenCalledWith(1);
      expect(documentService.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateFileName', () => {
    it('should update filename successfully', async () => {
      const updateDto: UpdateFilenameDto = {
        filename: 'updated.pdf',
      };

      const updatedDocument = createMockDocument({ filename: 'updated.pdf' });

      documentService.findOne.mockResolvedValue(mockDocument);
      documentService.updateFilename.mockResolvedValue(updatedDocument);

      const result = await controller.updateFileName(1, updateDto);

      expect(documentService.findOne).toHaveBeenCalledWith(1);
      expect(documentService.updateFilename).toHaveBeenCalledWith(1, 'updated.pdf');
      expect(result).toEqual(updatedDocument);
    });

    it('should throw HttpException if document not found', async () => {
      const updateDto: UpdateFilenameDto = {
        filename: 'updated.pdf',
      };

      documentService.findOne.mockResolvedValue(null);

      await expect(controller.updateFileName(1, updateDto)).rejects.toThrow(
        new HttpException('Document not found', HttpStatus.NOT_FOUND),
      );

      expect(documentService.findOne).toHaveBeenCalledWith(1);
      expect(documentService.updateFilename).not.toHaveBeenCalled();
    });
  });
});