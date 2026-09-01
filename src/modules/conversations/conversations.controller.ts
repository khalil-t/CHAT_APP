import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { Conversations } from './entities/conversations.entity';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  findAll(@Query('userId') userId?: number): Promise<Conversations[]> {
    return this.conversationsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Conversations> {
    return this.conversationsService.findOne(id);
  }

  @Post()
  create(
    @Body() data: { userId: string; title?: string },
  ): Promise<Conversations> {
    return this.conversationsService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.conversationsService.remove(id);
  }
}
