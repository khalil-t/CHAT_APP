import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import { User } from './entities/user.entity';

@Injectable()
export class UserService{
    constructor(
@InjectRepository(User)
private readonly userRepository: Repository<User>,
    ){}

async getUser(userId : string): Promise<User>{
const user = await this.userRepository.findOne({
    where:{
        id:userId
    }
})

 if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
}



}