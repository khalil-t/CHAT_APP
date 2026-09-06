import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

describe('ConversationsController', () => {
  let controller: ConversationsController;

  const mockConversationsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: mockConversationsService,
        },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all conversations', async () => {
      const mockConversations = [{ id: 1, userId: 'user-1' }];
      mockConversationsService.findAll.mockResolvedValue(mockConversations);

      const result = await controller.findAll(1);

      expect(mockConversationsService.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockConversations);
    });
  });

  describe('findOne', () => {
    it('should return a conversation by id', async () => {
      const mockConversation = { id: 1, userId: 'user-1' };
      mockConversationsService.findOne.mockResolvedValue(mockConversation);

      const result = await controller.findOne(1);

      expect(mockConversationsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockConversation);
    });
  });

  describe('create', () => {
    it('should create a conversation', async () => {
      const mockData = { userId: 'user-1', title: 'New chat' };
      const mockConversation = { id: 1, ...mockData };
      mockConversationsService.create.mockResolvedValue(mockConversation);

      const result = await controller.create(mockData);

      expect(mockConversationsService.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockConversation);
    });
  });

  describe('remove', () => {
    it('should delete a conversation', async () => {
      mockConversationsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockConversationsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
