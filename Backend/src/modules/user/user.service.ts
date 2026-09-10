import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async search(
    search?: string,
    page?: string,
    limit?: string,
  ): Promise<User[]> {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const query = search?.trim();

    if (!query) {
      return this.userRepository.find({
        order: { createdAt: 'DESC' },
        skip,
        take,
      });
    }

    return this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) LIKE :query', {
        query: `%${query.toLowerCase()}%`,
      })
      .orderBy('user.created_at', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();
  }
}
