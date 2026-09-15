import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { Conversations } from './entities/conversations.entity';
import { Conversation_Members } from '../conversation_members/entities/conversation_members.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversations)
    private readonly conversationsRepository: Repository<Conversations>,
    @InjectRepository(Conversation_Members)
    private readonly conversationMembersRepository: Repository<Conversation_Members>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(userId: string): Promise<Conversations[]> {
    const members = await this.conversationMembersRepository.find({
      where: { userId },
    });

    const conversationIds = members.map((member) => member.conversationId);

    if (conversationIds.length === 0) {
      return [];
    }

    return this.conversationsRepository.find({
      where: { id: In(conversationIds) },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Conversations> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with id "${id}" not found`);
    }

    return conversation;
  }

  async create(data: {
    currentUserId: string;
    targetUserId: string;
    title?: string;
  }): Promise<Conversations> {
    const { currentUserId, targetUserId, title } = data;

    if (!targetUserId) {
      throw new BadRequestException('targetUserId is required');
    }

    if (targetUserId === currentUserId) {
      throw new BadRequestException('Cannot start a conversation with yourself');
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException(`User with id "${targetUserId}" not found`);
    }

    const existing = await this.findConversationBetween(
      currentUserId,
      targetUserId,
    );

    if (existing) {
      return existing;
    }

    return this.dataSource.transaction(async (manager) => {
      const conversation = manager.create(Conversations, {
        userId: currentUserId,
        title: title ?? targetUser.email ?? 'New chat',
      });

      const savedConversation = await manager.save(conversation);

      await manager.insert(Conversation_Members, {
        userId: currentUserId,
        conversationId: savedConversation.id,
      });

      await manager.insert(Conversation_Members, {
        userId: targetUserId,
        conversationId: savedConversation.id,
      });

      return savedConversation;
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.conversationsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Conversation with id "${id}" not found`);
    }
  }

  private async findConversationBetween(
    userIdA: string,
    userIdB: string,
  ): Promise<Conversations | null> {
    const [membersA, membersB] = await Promise.all([
      this.conversationMembersRepository.find({ where: { userId: userIdA } }),
      this.conversationMembersRepository.find({ where: { userId: userIdB } }),
    ]);

    const conversationIdsForA = new Set(
      membersA.map((member) => member.conversationId),
    );

    const shared = membersB.find((member) =>
      conversationIdsForA.has(member.conversationId),
    );

    if (!shared) {
      return null;
    }

    return (
      (await this.conversationsRepository.findOne({
        where: { id: shared.conversationId },
      })) ?? null
    );
  }
}