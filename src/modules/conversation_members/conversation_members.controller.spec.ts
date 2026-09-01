import { Test, TestingModule } from '@nestjs/testing';
import { ConversationMembersController } from './conversation_members.controller';
import { ConversationMembersService } from './conversation_members.service';

describe('ConversationMembersController', () => {
  let controller: ConversationMembersController;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationMembersController],
      providers: [
        {
          provide: ConversationMembersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ConversationMembersController>(
      ConversationMembersController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all members', async () => {
      const mockMembers = [{ userId: 1, conversationId: 2 }];
      mockService.findAll.mockResolvedValue(mockMembers);

      const result = await controller.findAll(1);

      expect(mockService.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMembers);
    });
  });

  describe('findOne', () => {
    it('should return a member', async () => {
      const mockMember = { userId: 1, conversationId: 2 };
      mockService.findOne.mockResolvedValue(mockMember);

      const result = await controller.findOne(1, 2);

      expect(mockService.findOne).toHaveBeenCalledWith({
        userId: 1,
        conversationId: 2,
      });
      expect(result).toEqual(mockMember);
    });
  });

  describe('create', () => {
    it('should create a member', async () => {
      const mockData = { userId: 1, conversationId: 2 };
      const mockMember = { id: 1, ...mockData };
      mockService.create.mockResolvedValue(mockMember);

      const result = await controller.create(mockData);

      expect(mockService.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockMember);
    });
  });

  describe('remove', () => {
    it('should delete a member', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1, 2);

      expect(mockService.remove).toHaveBeenCalledWith({
        userId: 1,
        conversationId: 2,
      });
    });
  });
});
