import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

describe('ContactsController', () => {
  let controller: ContactsController;

  const mockContactsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: ContactsService,
          useValue: mockContactsService,
        },
      ],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of contacts', async () => {
      const mockContacts = [{ id: 1, userId: 1, contactUserId: 2 }];
      mockContactsService.findAll.mockResolvedValue(mockContacts);

      const result = await controller.findAll(1);

      expect(mockContactsService.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockContacts);
    });
  });

  describe('findOne', () => {
    it('should return a contact', async () => {
      const mockContact = { id: 1, userId: 1, contactUserId: 2 };
      mockContactsService.findOne.mockResolvedValue(mockContact);

      const result = await controller.findOne(1, 2);

      expect(mockContactsService.findOne).toHaveBeenCalledWith({ userId: 1, contactUserId: 2 });
      expect(result).toEqual(mockContact);
    });
  });

  describe('create', () => {
    it('should create a contact', async () => {
      const mockData = { userId: 1, contactUserId: 2, status: 'active' };
      const mockContact = { id: 1, ...mockData };
      mockContactsService.create.mockResolvedValue(mockContact);

      const result = await controller.create(mockData);

      expect(mockContactsService.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockContact);
    });
  });

  describe('updateStatus', () => {
    it('should update contact status', async () => {
      const mockData = { userId: 1, contactUserId: 2, status: 'blocked' };
      const mockContact = { id: 1, ...mockData };
      mockContactsService.updateStatus.mockResolvedValue(mockContact);

      const result = await controller.updateStatus(mockData);

      expect(mockContactsService.updateStatus).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockContact);
    });
  });

  describe('remove', () => {
    it('should delete a contact', async () => {
      mockContactsService.remove.mockResolvedValue(undefined);

      await controller.remove(1, 2);

      expect(mockContactsService.remove).toHaveBeenCalledWith({ userId: 1, contactUserId: 2 });
    });
  });
});
