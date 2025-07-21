import { Ingestion, IngestionStatus } from '../../../src/modules/ingestion/ingestion.entity';
import { createMockDocument } from './document.mock';
import { createMockUser } from './user.mock';

export const createMockIngestion = (overrides: Partial<Ingestion> = {}) => ({
  id: 1,
  uuid: 'ingestion-uuid',
  status: IngestionStatus.PENDING,
  progress: 0,
  errorMessage: null,
  embeddingsGenerated: null,
  document: createMockDocument(),
  triggeredBy: createMockUser(),
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  archived: null,
  reload: jest.fn(),
  ...overrides,
});

export const createMockIngestions = (count: number): Ingestion[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockIngestion({
      id: index + 1,
      uuid: `ingestion-uuid-${index + 1}`,
      status: index % 2 === 0 ? IngestionStatus.COMPLETED : IngestionStatus.PROCESSING,
      progress: index % 2 === 0 ? 100 : 50,
    })
  );
};