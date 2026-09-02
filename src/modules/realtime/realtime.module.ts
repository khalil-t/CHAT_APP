import { Module } from '@nestjs/common';

import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import {
  RealtimeConsumer,
} from '../../infrastructure/rabbitmq/realtime.consumer';

import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [AuthModule],
  providers: [RealtimeGateway, RealtimeService , RealtimeConsumer],
  exports: [RealtimeService],
})
export class RealtimeModule {}
