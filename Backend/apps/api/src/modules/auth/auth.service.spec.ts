import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { BcryptService } from './bcrypt.service';
import jwtConfig from '@app/common/config/jwt.config';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtConfig = {
    secret: 'test-secret',
    accessTokenTtl: '3600',
  };

  const mockBcryptService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: jwtConfig.KEY,
          useValue: mockJwtConfig,
        },
        {
          provide: BcryptService,
          useValue: mockBcryptService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should save a new user', async () => {
      const signUpDto = {
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        created_at: new Date(),
      };
      mockBcryptService.hash.mockResolvedValue('hashedPassword');
      mockUserRepository.save.mockResolvedValue(true);

      await service.signUp(signUpDto);

      expect(mockBcryptService.hash).toHaveBeenCalledWith('password123');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should return access token for valid credentials', async () => {
      const signInDto = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockBcryptService.compare.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('valid-jwt-token');

      const result = await service.signIn(signInDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(mockBcryptService.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(mockJwtService.signAsync).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'valid-jwt-token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const signInDto = { email: 'test@example.com', password: 'password123' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const signInDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockBcryptService.compare.mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
