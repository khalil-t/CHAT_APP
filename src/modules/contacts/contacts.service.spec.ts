import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Contact } from './entities/contacts.entity';
import { NotFoundException } from '@nestjs/common';

describe('ContactsService', () => {
  let service: ContactsService;

  const mockContactsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getRepositoryToken(Contact),
          useValue: mockContactsRepository,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of contacts', async () => {
      const mockContacts = [{ id: 1, userId: 1, contactUserId: 2 }];
      mockContactsRepository.find.mockResolvedValue(mockContacts);

      const result = await service.findAll(1);

      expect(mockContactsRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
        relations: ['contactUser'],
      });
      expect(result).toEqual(mockContacts);
    });
  });

  describe('findOne', () => {
    it('should return a contact if found', async () => {
      const mockContact = { id: 1, userId: 1, contactUserId: 2 };
      mockContactsRepository.findOne.mockResolvedValue(mockContact);

      const result = await service.findOne({ userId: 1, contactUserId: 2 });

      expect(mockContactsRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1, contactUserId: 2 },
        relations: ['contactUser'],
      });
      expect(result).toEqual(mockContact);
    });

    it('should throw NotFoundException if contact not found', async () => {
      mockContactsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne({ userId: 1, contactUserId: 2 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a contact', async () => {
      const mockData = { userId: 1, contactUserId: 2, status: 'active' };
      const mockCreatedContact = { id: 1, ...mockData };
      mockContactsRepository.create.mockReturnValue(mockCreatedContact);
      mockContactsRepository.save.mockResolvedValue(mockCreatedContact);

      const result = await service.create(mockData);

      expect(mockContactsRepository.create).toHaveBeenCalledWith({
        userId: 1,
        contactUserId: 2,
        status: 'active',
      });
      expect(mockContactsRepository.save).toHaveBeenCalledWith(mockCreatedContact);
      expect(result).toEqual(mockCreatedContact);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a contact', async () => {
      const mockContact = { id: 1, userId: 1, contactUserId: 2, status: 'active' };
      mockContactsRepository.findOne.mockResolvedValue(mockContact);
      mockContactsRepository.save.mockResolvedValue({ ...mockContact, status: 'blocked' });

      const result = await service.updateStatus({ userId: 1, contactUserId: 2, status: 'blocked' });

      expect(result.status).toEqual('blocked');
      expect(mockContactsRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a contact successfully', async () => {
      mockContactsRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove({ userId: 1, contactUserId: 2 });

      expect(mockContactsRepository.delete).toHaveBeenCalledWith({ userId: 1, contactUserId: 2 });
    });

    it('should throw NotFoundException if no rows affected', async () => {
      mockContactsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove({ userId: 1, contactUserId: 2 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
