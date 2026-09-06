import { Module } from '@nestjs/common';

import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

import { RealtimeConsumer } from '../../infrastructure/rabbitmq/realtime.consumer';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { AuthModule } from '../auth/auth.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [AuthModule, MessageModule, RabbitMQModule],
  providers: [RealtimeGateway, RealtimeService, RealtimeConsumer],
  exports: [RealtimeService],
})
export class RealtimeModule {}
