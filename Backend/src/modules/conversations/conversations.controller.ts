import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';

import { ActiveUser } from '../../common/decorators/active-user.decorator';
import { Conversations } from './entities/conversations.entity';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  findAll(@ActiveUser('id') currentUserId: string): Promise<Conversations[]> {
    return this.conversationsService.findAll(currentUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Conversations> {
    return this.conversationsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @ActiveUser('id') currentUserId: string,
    @Body() data: { targetUserId: string; title?: string },
  ): Promise<Conversations> {
    return this.conversationsService.create({
      currentUserId,
      targetUserId: data.targetUserId,
      title: data.title,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.conversationsService.remove(id);
  }
}