import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import jwtConfig from '../../common/config/jwt.config';
import { REQUEST_USER_KEY } from '../../common/constants';
import type { ActiveUserData } from '../../common/interfaces/active-user-data.interface';


@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.getToken(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<ActiveUserData>(
        token,
        this.jwtConfiguration,
      );

      if (!payload) {
        throw new UnauthorizedException('Authorization token is not valid');
      }

      request[REQUEST_USER_KEY] = payload;
    } catch (error) {
      throw new UnauthorizedException((error as Error).message);
    }

    return true;
  }

  private getToken(request: Request) {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}


