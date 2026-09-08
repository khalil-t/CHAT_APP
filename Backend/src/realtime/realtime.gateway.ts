import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Server, Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId: string;
}

@WebSocketGateway({
  namespace: '/realtime',
  cors: {
   cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
  },
})
export class RealtimeGateway {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.logger.log(
      `Gateway CORS origin: ${this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'}`,
    );
  }

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token as string;

    if (!token) {
      this.logger.warn(`No JWT from socket ${client.id}`);
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      client.data.user = payload;
      (client as AuthenticatedSocket).userId = payload.sub;
      this.logger.log(`User ${payload.sub} connected`);
    } catch {
      this.logger.warn(`Invalid JWT from socket ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      message: 'Hello from NestJS',
    });
  }


  @SubscribeMessage('conversation:join')
  async joinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: { conversationId: string },
  ) {
    await client.join(`conversation:${dto.conversationId}`);
    this.logger.log(
      `User ${client.userId} joined conversation ${dto.conversationId}`,
    );
  }

   @SubscribeMessage('conversation:leave')
  async leaveConversation(
    @ConnectedSocket()
    client: AuthenticatedSocket,

    @MessageBody() dto: { conversationId: string },

  ) {
    const room =
      `conversation:${dto.conversationId}`;

    await client.leave(room);

    client.emit(
      'conversation:left',
      {
        conversationId:
          dto.conversationId,
      },
    );
  }

deliverMessage(message: any) {
  this.server
    .to(
      `conversation:${message.conversationId}`,
    )
    .emit(
      'message:new',
      message,
    );
}

}
