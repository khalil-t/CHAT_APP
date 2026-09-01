import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Conversations } from './entities/conversations.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversations)
    private readonly conversationsRepository: Repository<Conversations>,
  ) {}

  async findAll(userId?: number): Promise<Conversations[]> {
    if (!userId) {
      return this.conversationsRepository.find({
        order: { createdAt: 'DESC' },
      });
    }

    return this.conversationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Conversations> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with id "${id}" not found`);
    }

    return conversation;
  }

  async create(data: {
    userId: string;
    title?: string;
  }): Promise<Conversations> {
    const conversation = this.conversationsRepository.create({
      userId: data.userId,
      title: data.title ?? 'New chat',
    });

    return this.conversationsRepository.save(conversation);
  }

  async remove(id: string): Promise<void> {
    const result = await this.conversationsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Conversation with id "${id}" not found`);
    }
  }
}
