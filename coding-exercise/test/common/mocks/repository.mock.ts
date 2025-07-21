import { Repository } from 'typeorm';

export const createMockRepository = () => {
  return {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    query: jest.fn(),
    clear: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    insert: jest.fn(),
    upsert: jest.fn(),
    recover: jest.fn(),
    restore: jest.fn(),
    softDelete: jest.fn(),
    softRemove: jest.fn(),
    preload: jest.fn(),
    merge: jest.fn(),
    getId: jest.fn(),
    hasId: jest.fn(),
    extend: jest.fn(),
    target: {} as any,
    manager: {} as any,
    metadata: {} as any,
    queryRunner: undefined,
  };
};