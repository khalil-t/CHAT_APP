import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conversations } from './entities/conversations.entity';
import { NotFoundException } from '@nestjs/common';

describe('ConversationsService', () => {
  let service: ConversationsService;

  const mockConversationsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: getRepositoryToken(Conversations),
          useValue: mockConversationsRepository,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all conversations if no userId provided', async () => {
      const mockConversations = [{ id: 1, userId: 'user-1' }];
      mockConversationsRepository.find.mockResolvedValue(mockConversations);

      const result = await service.findAll();

      expect(mockConversationsRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockConversations);
    });

    it('should return conversations for a specific user', async () => {
      const mockConversations = [{ id: 1, userId: 'user-1' }];
      mockConversationsRepository.find.mockResolvedValue(mockConversations);

      const result = await service.findAll(1 as any);

      expect(mockConversationsRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockConversations);
    });
  });

  describe('findOne', () => {
    it('should return a conversation if found', async () => {
      const mockConversation = { id: 1, userId: 'user-1' };
      mockConversationsRepository.findOne.mockResolvedValue(mockConversation);

      const result = await service.findOne(1);

      expect(mockConversationsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockConversation);
    });

    it('should throw NotFoundException if conversation not found', async () => {
      mockConversationsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a conversation', async () => {
      const mockData = { userId: 'user-1', title: 'Test Chat' };
      const mockCreated = { id: 1, ...mockData };
      mockConversationsRepository.create.mockReturnValue(mockCreated);
      mockConversationsRepository.save.mockResolvedValue(mockCreated);

      const result = await service.create(mockData);

      expect(mockConversationsRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        title: 'Test Chat',
      });
      expect(mockConversationsRepository.save).toHaveBeenCalledWith(mockCreated);
      expect(result).toEqual(mockCreated);
    });

    it('should create with default title if not provided', async () => {
      const mockData = { userId: 'user-1' };
      const mockCreated = { id: 1, userId: 'user-1', title: 'New chat' };
      mockConversationsRepository.create.mockReturnValue(mockCreated);
      mockConversationsRepository.save.mockResolvedValue(mockCreated);

      const result = await service.create(mockData);

      expect(mockConversationsRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        title: 'New chat',
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('remove', () => {
    it('should remove a conversation successfully', async () => {
      mockConversationsRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockConversationsRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if no rows affected', async () => {
      mockConversationsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
