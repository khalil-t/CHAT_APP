import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authService.signUp', async () => {
      const signUpDto = { email: 'test@example.com', password: 'password123', passwordConfirm: 'password123', created_at: new Date() };
      mockAuthService.signUp.mockResolvedValue(undefined);

      await controller.signUp(signUpDto);

      expect(mockAuthService.signUp).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn and return access token', async () => {
      const signInDto = { email: 'test@example.com', password: 'password123' };
      mockAuthService.signIn.mockResolvedValue({ accessToken: 'valid-jwt-token' });

      const result = await controller.signIn(signInDto);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(signInDto);
      expect(result).toEqual({ accessToken: 'valid-jwt-token' });
    });
  });
});
