import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../../../src/common/guards/roles.guard';
import { ROLES_KEY } from '../../../src/common/decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(null);
      const context = createMockExecutionContext({ role: 'viewer' });

      const result = guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should return true if user has required role', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin', 'editor']);
      const context = createMockExecutionContext({ role: 'admin' });

      const result = guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin', 'editor']);
      const context = createMockExecutionContext({ role: 'viewer' });

      const result = guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(result).toBe(false);
    });

    it('should return false if user role is undefined', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);
      const context = createMockExecutionContext({ role: undefined });

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });
});