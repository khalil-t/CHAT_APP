import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';

import { Message } from './entities/message.entity';
import { MessageService } from './message.service';
import { isUUID } from 'class-validator';

@Controller('messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);
  constructor(private readonly messageService: MessageService) {}

  @Get()
  findAll(
    @Query('conversationId') conversationId?: string,
  ): Promise<Message[]> {
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
    const conversationId = data.conversationId ?? null;

    if (conversationId && !isUUID(conversationId as string)) {
      const isDev = process.env.NODE_ENV !== 'production';

      if (isDev) {
        this.logger.warn(`Received non-UUID conversationId "${conversationId}" in development; treating as null.`);
        return this.messageService.create({
          ...data,
          conversationId: null,
        });
      }

      throw new BadRequestException('conversationId must be a valid UUID');
    }

    return this.messageService.create({
      ...data,
      conversationId,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.messageService.remove(id);
  }
}
