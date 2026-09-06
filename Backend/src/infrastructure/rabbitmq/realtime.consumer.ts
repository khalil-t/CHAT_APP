import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import {
  ConsumeMessage,
} from 'amqplib';

import {
  RabbitMQService,
} from './rabbitmq.service';

import {
  RealtimeGateway,
} from '../../modules/realtime/realtime.gateway';

@Injectable()
export class RealtimeConsumer
  implements OnModuleInit
{
  private readonly logger =
    new Logger(
      RealtimeConsumer.name,
    );

  constructor(
    private readonly rabbitMQ:
      RabbitMQService,

    private readonly gateway:
      RealtimeGateway,
  ) {}

  async onModuleInit() {
    await this.rabbitMQ.consume(
      'chat.events',
      'realtime.messages',
      'message.created',
      async (
        message: ConsumeMessage,
      ) => {
        const event =
          JSON.parse(
            message.content.toString(),
          );

        this.logger.log(
          `Received message.created: ${event.messageId}`,
        );

        this.gateway.deliverMessage(
          event,
        );
      },
    );
  }
}