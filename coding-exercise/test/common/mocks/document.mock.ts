import { Document } from '../../../src/modules/document/document.entity';
import { createMockUser } from './user.mock';

export const createMockDocument = (overrides: Partial<Document> = {}): Document => ({
  id: 1,
  uuid: 'doc-uuid',
  filename: 'test.pdf',
  mimetype: 'application/pdf',
  url: 'https://example.com/test.pdf',
  uploadedBy: createMockUser(),
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  archived: null,
  ...overrides,
});

export const createMockDocuments = (count: number): Document[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockDocument({
      id: index + 1,
      uuid: `doc-uuid-${index + 1}`,
      filename: `document-${index + 1}.pdf`,
    })
  );
};