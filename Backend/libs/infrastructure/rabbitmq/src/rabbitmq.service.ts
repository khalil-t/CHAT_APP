import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger =
    new Logger(RabbitMQService.name);

  private connection: amqp.Connection & any;
  private channel: amqp.Channel & any;
 
  constructor(private readonly configService: ConfigService) {}
  async onModuleInit() {
    await this.connect();
  }

  private async connect(retries = 10, delay = 1000) {
    const host =
      this.configService.get<string>('RABBITMQ_HOST') ?? 'localhost';
    const port = Number(
      this.configService.get<number>('RABBITMQ_PORT') ?? 5672,
    );

    const opts: Record<string, unknown> = {
      protocol: 'amqp',
      hostname: host,
      port,
    };

    const user = this.configService.get<string>('RABBITMQ_USER');
    const pass = this.configService.get<string>('RABBITMQ_PASSWORD');

    if (user) opts.username = user;
    if (pass) opts.password = pass;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.connection = (await amqp.connect(opts)) as any;
        this.channel = await this.connection.createChannel();
        this.logger.log('Connected to RabbitMQ');
        return;
      } catch (error) {
        this.logger.warn(
          `RabbitMQ connection attempt ${attempt}/${retries} failed: ${error.message}`,
        );

        if (attempt === retries) {
          this.logger.error('Max retries reached. Could not connect to RabbitMQ.');
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  async publish(
    exchange: string,
    routingKey: string,
    message: unknown,
  ) {
    await this.channel.assertExchange(
      exchange,
      'topic',
      {
        durable: true,
      },
    );

    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(
        JSON.stringify(message),
      ),
      {
        persistent: true,
      },
    );
  }

async consume(
  exchange: string,
  queue: string,
  routingKey: string,
  handler: (
    message: amqp.ConsumeMessage,
  ) => Promise<void>,
) {
  await this.channel.assertExchange(
    exchange,
    'topic',
    {
      durable: true,
    },
  );

  await this.channel.assertQueue(
    queue,
    {
      durable: true,
    },
  );

  await this.channel.bindQueue(
    queue,
    exchange,
    routingKey,
  );

  await this.channel.consume(
    queue,
    async (message) => {
      if (!message) {
        return;
      }

      try {
        await handler(message);

        this.channel.ack(
          message,
        );
      } catch (error) {
        this.logger.error(
          'Message processing failed',
          error,
        );

        this.channel.nack(
          message,
          false,
          true,
        );
      }
    },
  );
}

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}