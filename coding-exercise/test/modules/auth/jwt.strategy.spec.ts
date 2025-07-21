import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../../../src/modules/auth/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should return the payload', async () => {
      const payload = {
        sub: 1,
        uuid: 'test-uuid',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        email: 'test@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual(payload);
    });
  });
});