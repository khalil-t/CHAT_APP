import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async findAll(conversationId?: string): Promise<Message[]> {
    if (!conversationId) {
      return this.messageRepository.find({
        relations: ['sender'],
        order: { sentAt: 'ASC' },
      });
    }

    return this.messageRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { sentAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }

    return message;
  }

  async create(data: {
    conversationId?: string | null;
    senderId: string;
    content: string;
  }): Promise<Message> {
    const message = this.messageRepository.create({
      conversationId: data.conversationId ?? null,
      senderId: data.senderId,
      content: data.content,
    });

    return this.messageRepository.save(message);
  }

  async remove(id: string): Promise<void> {
    const result = await this.messageRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }
  }
}
