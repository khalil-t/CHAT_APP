import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly eventEmitter: EventEmitter2,
    private readonly rabbitMQ:RabbitMQService,
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
this.messageRepository.save(message);

    await this.rabbitMQ.publish(
 'chat.events',
    'message.created',
    {
      messageId: message.id,
      conversationId:
        message.conversationId,
      senderId: message.senderId,
      content: message.content,
      readAt: message.readAt,
    },
    )

    return message
  }

  async remove(id: string): Promise<void> {
    const result = await this.messageRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }
  }

  async markAsRead(id: string, userId: string): Promise<Message> {
    const message = await this.findOne(id);

    if (!message.readAt && message.senderId !== userId) {
      message.readAt = new Date();
      return this.messageRepository.save(message);
    }

    return message;
  }
}
