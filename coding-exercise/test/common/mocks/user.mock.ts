import { User, UserRole } from '../../../src/modules/users/users.entity';

export const createMockUser = (overrides: Partial<User> = {}) => ({
  id: 1,
  uuid: 'test-uuid',
  email: 'test@example.com',
  password: 'hashedPassword',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  role: UserRole.VIEWER,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  archived: null,
  reload: jest.fn(),
  ...overrides,
});

export const createMockAdmin = (): User => createMockUser({
  id: 2,
  uuid: 'admin-uuid',
  email: 'admin@example.com',
  role: UserRole.ADMIN,
});

export const createMockEditor = (): User => createMockUser({
  id: 3,
  uuid: 'editor-uuid',
  email: 'editor@example.com',
  role: UserRole.EDITOR,
});