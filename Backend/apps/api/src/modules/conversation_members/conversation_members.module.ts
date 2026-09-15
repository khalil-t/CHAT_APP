import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConversationMembersController } from './conversation_members.controller';
import { ConversationMembersService } from './conversation_members.service';
import { Conversation_Members } from './entities/conversation_members.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation_Members])],
  controllers: [ConversationMembersController],
  providers: [ConversationMembersService],
})
export class ConversationMembersModule {}
