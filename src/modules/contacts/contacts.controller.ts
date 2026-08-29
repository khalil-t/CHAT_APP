import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { Contact } from './entities/contacts.entity';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  findAll(@Query('userId') userId: number): Promise<Contact[]> {
    return this.contactsService.findAll(userId);
  }

  @Get('find-one')
  findOne(
    @Query('userId') userId: number,
    @Query('contactUserId') contactUserId: number
  ): Promise<Contact> {
    return this.contactsService.findOne({ userId, contactUserId });
  }

  @Post()
  create(
    @Body()
    data: { userId: number; contactUserId: number; status?: string }
  ): Promise<Contact> {
    return this.contactsService.create(data);
  }

  @Patch('status')
  updateStatus(
    @Body()
    data: { userId: number; contactUserId: number; status: string }
  ): Promise<Contact> {
    return this.contactsService.updateStatus(data);
  }

  @Delete()
  remove(
    @Query('userId') userId: number,
    @Query('contactUserId') contactUserId: number
  ): Promise<void> {
    return this.contactsService.remove({ userId, contactUserId });
  }
}
