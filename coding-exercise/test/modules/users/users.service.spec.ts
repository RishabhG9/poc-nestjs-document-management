import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';

import { UserService } from '../../../src/modules/users/users.service';
import { User, UserRole } from '../../../src/modules/users/users.entity';
import { UpdateUserDto } from '../../../src/modules/users/dto/user-response-dto';
import { createMockUser, createMockRepository } from '../../common/mocks';

describe('UserService', () => {
  let service: UserService;
  let repository: ReturnType<typeof createMockRepository>;

  const mockUser = createMockUser();

  beforeEach(async () => {
    const mockRepository = createMockRepository()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'hashedPassword',
        phone: '+1234567890',
        role: UserRole.VIEWER,
      };

      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(userData);

      expect(repository.create).toHaveBeenCalledWith(userData);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return paginated users without search', async () => {
      const users = [mockUser];
      repository.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.findAll(1, 10);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ data: users, total: 1 });
    });

    it('should return paginated users with search', async () => {
      const users = [mockUser];
      repository.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.findAll(1, 10, 'John');

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: [
          { firstName: ILike('%John%') },
          { lastName: ILike('%John%') },
          { email: ILike('%John%') },
        ],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ data: users, total: 1 });
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserDetail', () => {
    it('should update user details', async () => {
      const updateDto: UpdateUserDto = {
        first_name: 'Jane',
        role: UserRole.EDITOR,
      };

      const updatedUser = createMockUser({ ...updateDto });

      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserDetail(1, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockUser,
        ...updateDto,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw error if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.updateUserDetail(1, {})).rejects.toThrow('User not found');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});