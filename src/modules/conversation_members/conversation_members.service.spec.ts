import { Test, TestingModule } from '@nestjs/testing';
import { ConversationMembersService } from './conversation_members.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conversation_Members } from './entities/conversation_members.entity';
import { NotFoundException } from '@nestjs/common';

describe('ConversationMembersService', () => {
  let service: ConversationMembersService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationMembersService,
        {
          provide: getRepositoryToken(Conversation_Members),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ConversationMembersService>(
      ConversationMembersService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all members if no userId provided', async () => {
      const mockMembers = [{ userId: 1, conversationId: 2 }];
      mockRepo.find.mockResolvedValue(mockMembers);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith({
        order: { joined_at: 'DESC' },
      });
      expect(result).toEqual(mockMembers);
    });

    it('should return members for a specific user', async () => {
      const mockMembers = [{ userId: 1, conversationId: 2 }];
      mockRepo.find.mockResolvedValue(mockMembers);

      const result = await service.findAll(1);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { joined_at: 'DESC' },
      });
      expect(result).toEqual(mockMembers);
    });
  });

  describe('findOne', () => {
    it('should return a member if found', async () => {
      const mockMember = { userId: 1, conversationId: 2 };
      mockRepo.findOne.mockResolvedValue(mockMember);

      const result = await service.findOne({ userId: 1, conversationId: 2 });

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 1, conversationId: 2 },
      });
      expect(result).toEqual(mockMember);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOne({ userId: 1, conversationId: 2 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a member', async () => {
      const mockData = { userId: 1, conversationId: 2 };
      const mockCreated = { id: 1, ...mockData };
      mockRepo.create.mockReturnValue(mockCreated);
      mockRepo.save.mockResolvedValue(mockCreated);

      const result = await service.create(mockData);

      expect(mockRepo.create).toHaveBeenCalledWith(mockData);
      expect(mockRepo.save).toHaveBeenCalledWith(mockCreated);
      expect(result).toEqual(mockCreated);
    });
  });

  describe('remove', () => {
    it('should remove a member successfully', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      await service.remove({ userId: 1, conversationId: 2 });

      expect(mockRepo.delete).toHaveBeenCalledWith({
        userId: 1,
        conversationId: 2,
      });
    });

    it('should throw NotFoundException if no rows affected', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(
        service.remove({ userId: 1, conversationId: 2 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
