import { Controller, Get, Param, Query } from '@nestjs/common';

import { ActiveUser } from '../../common/decorators/active-user.decorator';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('user')
  async getUser(@ActiveUser('id') userId: string): Promise<User> {
    return this.usersService.getUser(userId);
  }

  @Get()
  search(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<User[]> {
    return this.usersService.search(search, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.getUser(id);
  }
}
