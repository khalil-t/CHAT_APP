import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import jwtConfig from '../common/config/jwt.config';
import { RabbitMQModule } from '../infrastructure/rabbitmq/rabbitmq.module';

import { RealtimeConsumer } from './realtime.consumer';
import { RealtimeGateway } from './realtime.gateway';
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