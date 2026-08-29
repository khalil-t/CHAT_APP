import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { Message } from './entities/message.entity';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  findAll(@Query('conversationId') conversationId?: string): Promise<Message[]> {
    return this.messageService.findAll(conversationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Message> {
    return this.messageService.findOne(id);
  }

  @Post()
  create(
    @Body()
    data: {
      conversationId?: string | null;
      senderId: string;
      content: string;
    },
  ): Promise<Message> {
    return this.messageService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.messageService.remove(id);
  }
}
