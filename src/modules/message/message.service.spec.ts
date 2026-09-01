import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { NotFoundException } from '@nestjs/common';

describe('MessageService', () => {
  let service: MessageService;

  const mockMessageRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all messages if no conversationId provided', async () => {
      const mockMessages = [{ id: '1', content: 'test' }];
      mockMessageRepository.find.mockResolvedValue(mockMessages);

      const result = await service.findAll();

      expect(mockMessageRepository.find).toHaveBeenCalledWith({
        relations: ['sender'],
        order: { sentAt: 'ASC' },
      });
      expect(result).toEqual(mockMessages);
    });

    it('should return messages for a specific conversation', async () => {
      const mockMessages = [
        { id: '1', content: 'test', conversationId: 'conv-1' },
      ];
      mockMessageRepository.find.mockResolvedValue(mockMessages);

      const result = await service.findAll('conv-1');

      expect(mockMessageRepository.find).toHaveBeenCalledWith({
        where: { conversationId: 'conv-1' },
        relations: ['sender'],
        order: { sentAt: 'ASC' },
      });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('findOne', () => {
    it('should return a message if found', async () => {
      const mockMessage = { id: '1', content: 'hello' };
      mockMessageRepository.findOne.mockResolvedValue(mockMessage);

      const result = await service.findOne('1');

      expect(mockMessageRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['sender'],
      });
      expect(result).toEqual(mockMessage);
    });

    it('should throw NotFoundException if message not found', async () => {
      mockMessageRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a message', async () => {
      const mockData = {
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Hi',
      };
      const mockCreated = { id: '1', ...mockData };
      mockMessageRepository.create.mockReturnValue(mockCreated);
      mockMessageRepository.save.mockResolvedValue(mockCreated);

      const result = await service.create(mockData);

      expect(mockMessageRepository.create).toHaveBeenCalledWith(mockData);
      expect(mockMessageRepository.save).toHaveBeenCalledWith(mockCreated);
      expect(result).toEqual(mockCreated);
    });

    it('should create with null conversationId if not provided', async () => {
      const mockData = { senderId: 'user-1', content: 'Hi' };
      const expectedCreate = {
        conversationId: null,
        senderId: 'user-1',
        content: 'Hi',
      };
      const mockCreated = { id: '1', ...expectedCreate };
      mockMessageRepository.create.mockReturnValue(mockCreated);
      mockMessageRepository.save.mockResolvedValue(mockCreated);

      const result = await service.create(mockData);

      expect(mockMessageRepository.create).toHaveBeenCalledWith(expectedCreate);
      expect(result).toEqual(mockCreated);
    });
  });

  describe('remove', () => {
    it('should remove a message successfully', async () => {
      mockMessageRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockMessageRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if no rows affected', async () => {
      mockMessageRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
