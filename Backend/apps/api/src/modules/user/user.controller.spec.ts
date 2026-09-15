import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    getUser: jest.fn(),
  };

  beforeEach(async () => {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return a user', async () => {
      const mockUser = { id: '1', name: 'John Doe' };
      mockUserService.getUser.mockResolvedValue(mockUser);

      const result = await controller.getUser('1');

      expect(mockUserService.getUser).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });
  });
});
