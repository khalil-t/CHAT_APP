import { Controller, Get } from '@nestjs/common';


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
}