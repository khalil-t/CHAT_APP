import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Contact } from './entities/contacts.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,
  ) {}

  async findAll(userId: number): Promise<Contact[]> {
    return this.contactsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['contactUser'],
    });
  }

  async findOne(data: {
    userId: number;
    contactUserId: number;
  }): Promise<Contact> {
    const contact = await this.contactsRepository.findOne({
      where: {
        userId: data.userId,
        contactUserId: data.contactUserId,
      },
      relations: ['contactUser'],
    });

    if (!contact) {
      throw new NotFoundException(`Contact relationship not found`);
    }

    return contact;
  }

  async create(data: {
    userId: number;
    contactUserId: number;
    status?: string;
  }): Promise<Contact> {
    const contact = this.contactsRepository.create({
      userId: data.userId,
      contactUserId: data.contactUserId,
      status: data.status ?? 'active',
    });

    return this.contactsRepository.save(contact);
  }

  async updateStatus(data: {
    userId: number;
    contactUserId: number;
    status: string;
  }): Promise<Contact> {
    const contact = await this.findOne({
      userId: data.userId,
      contactUserId: data.contactUserId,
    });

    contact.status = data.status;
    return this.contactsRepository.save(contact);
  }

  async remove(data: { userId: number; contactUserId: number }): Promise<void> {
    const result = await this.contactsRepository.delete({
      userId: data.userId,
      contactUserId: data.contactUserId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Contact relationship not found');
    }
  }
}
