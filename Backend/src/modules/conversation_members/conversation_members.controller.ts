import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';

import { Conversation_Members } from './entities/conversation_members.entity';
import { ConversationMembersService } from './conversation_members.service';

@Controller('conversation-members')
export class ConversationMembersController {
  constructor(
    private readonly conversationMembersService: ConversationMembersService,
  ) {}

  @Get()
  findAll(@Query('userId') userId?: string): Promise<Conversation_Members[]> {
    return this.conversationMembersService.findAll(userId);
  }

  @Get('find-one')
  findOne(
    @Query('userId') userId: string,
    @Query('conversationId') conversationId: string,
  ): Promise<Conversation_Members> {
    return this.conversationMembersService.findOne({ userId, conversationId });
  }

  @Post()
  create(
    @Body()
    data: {
      userId: string;
      conversationId: string;
    },
  ): Promise<Conversation_Members> {
    return this.conversationMembersService.create(data);
  }

  @Delete()
  remove(
    @Query('userId') userId: string,
    @Query('conversationId') conversationId: string,
  ): Promise<void> {
    return this.conversationMembersService.remove({
      userId,
      conversationId,
    });
  }
}
