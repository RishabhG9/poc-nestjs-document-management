import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../../src/modules/users/users.controller';
import { UserService } from '../../../src/modules/users/users.service';
import { UpdateUserDto } from '../../../src/modules/users/dto/user-response-dto';
import { UserRole } from '../../../src/modules/users/users.entity';
import { createMockUser } from '../../common/mocks';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUser = createMockUser();

  beforeEach(async () => {
    const mockUserService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateUserDetail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const expectedResult = { data: [mockUser], total: 1 };
      userService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(1, 10, 'search');

      expect(userService.findAll).toHaveBeenCalledWith(1, 10, 'search');
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated users with default parameters', async () => {
      const expectedResult = { data: [mockUser], total: 1 };
      userService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(userService.findAll).toHaveBeenCalledWith(1, 10, undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      userService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(userService.findById).toHaveBeenCalledWith(1);
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
      userService.updateUserDetail.mockResolvedValue(updatedUser);

      const result = await controller.updateUserDetail(1, updateDto);

      expect(userService.updateUserDetail).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedUser);
    });
  });
});