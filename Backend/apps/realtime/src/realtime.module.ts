import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import jwtConfig from '@app/common/config/jwt.config';
import { RabbitMQModule } from '@app/infrastructure/rabbitmq';

import { RealtimeConsumer } from './consumers/realtime.consumer';
import { RealtimeGateway } from './gateways/realtime.gateway';
import { RealtimeService } from './realtime.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    RabbitMQModule,
  ],
  controllers: [],
  providers: [RealtimeGateway, RealtimeService, RealtimeConsumer],
})
export class RealtimeAppModule {}