import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import type { Repository } from 'typeorm';

import jwtConfig from '../../common/config/jwt.config';
import { MysqlErrorCode } from '../../common/enums/error-codes.enum';
import type { ActiveUserData } from '../../common/interfaces/active-user-data.interface';

import { User } from '../user/entities/user.entity';
import { BcryptService } from './bcrypt.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {

constructor(
      @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

){}

async signUp(signUpDto: SignUpDto): Promise<void> {
  const { email, password } = signUpDto;
  try {
    const user = new User();
    user.email = email;
    user.password = await this.bcryptService.hash(password);
    await this.userRepository.save(user);
  } catch (error) {
    throw error;
  }
}


async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
  const { email, password } = signInDto;
  const user = await this.userRepository.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const isPasswordMatch = await this.bcryptService.compare(
    password,
    user.password,
  );

  if (!isPasswordMatch) {
    throw new UnauthorizedException('Invalid email or password');
  }

  return await this.generateAccessToken(user);
}

async generateAccessToken(user: Partial<User>): Promise<{ accessToken: string }> {
  const tokenId = randomUUID();

  const accessToken = await this.jwtService.signAsync(
    {
      id: user.id,
      email: user.email,
      tokenId,
    } as ActiveUserData,
    {
      secret: this.jwtConfiguration.secret,
      expiresIn: parseInt(this.jwtConfiguration.accessTokenTtl || '3600', 10),
    },
  );
  return { accessToken };
}
}
