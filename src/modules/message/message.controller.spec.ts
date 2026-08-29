import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

describe('MessageController', () => {
  let controller: MessageController;

  const mockMessageService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all messages', async () => {
      const mockMessages = [{ id: '1', content: 'test' }];
      mockMessageService.findAll.mockResolvedValue(mockMessages);

      const result = await controller.findAll('conv-1');

      expect(mockMessageService.findAll).toHaveBeenCalledWith('conv-1');
      expect(result).toEqual(mockMessages);
    });
  });

  describe('findOne', () => {
    it('should return a message by id', async () => {
      const mockMessage = { id: '1', content: 'hello' };
      mockMessageService.findOne.mockResolvedValue(mockMessage);

      const result = await controller.findOne('1');

      expect(mockMessageService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockMessage);
    });
  });

  describe('create', () => {
    it('should create a message', async () => {
      const mockData = { conversationId: 'conv-1', senderId: 'user-1', content: 'Hi' };
      const mockMessage = { id: '1', ...mockData };
      mockMessageService.create.mockResolvedValue(mockMessage);

      const result = await controller.create(mockData);

      expect(mockMessageService.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockMessage);
    });
  });

  describe('remove', () => {
    it('should delete a message', async () => {
      mockMessageService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockMessageService.remove).toHaveBeenCalledWith('1');
    });
  });
});
