import { Injectable , NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import {Conversation_Members} from './entities/conversation_members.entity'
@Injectable()
export class ConversationMembersService {

 constructor(
    @InjectRepository(Conversation_Members)
    private readonly conversationsMembersRepository: Repository<Conversation_Members>,
  ) {}

  async findAll(userId?: Number): Promise<Conversation_Members[]> {
    if (!userId) {
      return this.conversationsMembersRepository.find({
        order: { joined_at: 'DESC' },
      });
    }

    return this.conversationsMembersRepository.find({
      where: { userId },
      order: { joined_at: 'DESC' },
    });
  }

  async findOne(
    data: { userId: number; conversationId: number }
  ): Promise<Conversation_Members> {
    const conversation = await this.conversationsMembersRepository.findOne({
      where: {
        userId: data.userId,
        conversationId: data.conversationId,
      },
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation member relationship not found`
      );
    }

    return conversation;
  }

  async create(
    data: { userId: number; conversationId: number }
  ): Promise<Conversation_Members> {
    const member = this.conversationsMembersRepository.create({
      userId: data.userId,
      conversationId: data.conversationId,
    });

    return this.conversationsMembersRepository.save(member);
  }
  async remove(data: {
    userId: number;
    conversationId: number;
  }): Promise<void> {
    const result = await this.conversationsMembersRepository.delete({
      userId: data.userId,
      conversationId: data.conversationId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        'Conversation member relationship not found'
      );
    }
  }

}
