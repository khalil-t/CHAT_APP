import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RealtimeGateway, AuthenticatedSocket } from './realtime.gateway';
import { MessageService } from '../message/message.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal mock socket. */
function createMockSocket(overrides: Partial<AuthenticatedSocket> = {}) {
  return {
    id: 'socket-1',
    handshake: { auth: { token: 'valid.jwt.token' } },
    data: {},
    disconnect: jest.fn(),
    emit: jest.fn(),
    join: jest.fn().mockResolvedValue(undefined),
    userId: '',
    ...overrides,
  } as unknown as AuthenticatedSocket;
}

/** Shared message stub returned by MessageService. */
const MESSAGE_STUB = {
  id: 'msg-1',
  conversationId: 'conv-1',
  senderId: 'user-1',
  content: 'Hello!',
  sentAt: new Date(),
  readAt: null,
};

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockJwtService = {
  verify: jest.fn().mockReturnValue({ sub: 'user-1' }),
};

const mockMessageService = {
  create: jest.fn().mockResolvedValue(MESSAGE_STUB),
  markAsRead: jest.fn().mockResolvedValue({ ...MESSAGE_STUB, readAt: new Date() }),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('http://localhost:3000'),
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        { provide: JwtService, useValue: mockJwtService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);

    // Give the gateway a fake server with a fluent .to().emit() chain
    (gateway as any).server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    jest.clearAllMocks();
    // Re-apply default return values after clearAllMocks()
    mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
    mockMessageService.create.mockResolvedValue(MESSAGE_STUB);
    mockMessageService.markAsRead.mockResolvedValue({
      ...MESSAGE_STUB,
      readAt: new Date(),
    });
    mockConfigService.get.mockReturnValue('http://localhost:3000');
  });

  // -------------------------------------------------------------------------
  // handleConnection
  // -------------------------------------------------------------------------
  describe('handleConnection', () => {
    it('should authenticate a socket with a valid JWT and set userId', () => {
      const client = createMockSocket();

      gateway.handleConnection(client);

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid.jwt.token');
      expect(client.userId).toBe('user-1');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect when no token is provided', () => {
      const client = createMockSocket({ handshake: { auth: {} } } as any);

      gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should disconnect when the JWT is invalid', () => {
      mockJwtService.verify.mockImplementationOnce(() => {
        throw new Error('invalid token');
      });

      const client = createMockSocket();

      gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // conversation:join
  // -------------------------------------------------------------------------
  describe('joinConversation', () => {
    it('should join the socket to the conversation room', async () => {
      const client = createMockSocket({ userId: 'user-1' });

      await gateway.joinConversation(client, { conversationId: 'conv-1' });

      expect(client.join).toHaveBeenCalledWith('conversation:conv-1');
    });
  });

  // -------------------------------------------------------------------------
  // message:send
  // -------------------------------------------------------------------------
  describe('sendMessage', () => {
    it('should persist the message and broadcast to the room', async () => {
      const client = createMockSocket({ userId: 'user-1' });
      const dto = { conversationId: 'conv-1', content: 'Hello!' };

      await gateway.sendMessage(client, dto);

      expect(mockMessageService.create).toHaveBeenCalledWith({
        senderId: 'user-1',
        conversationId: 'conv-1',
        content: 'Hello!',
      });

      expect((gateway as any).server.to).toHaveBeenCalledWith(
        'conversation:conv-1',
      );
      expect((gateway as any).server.emit).toHaveBeenCalledWith(
        'message:new',
        MESSAGE_STUB,
      );
    });
  });

  // -------------------------------------------------------------------------
  // message:read
  // -------------------------------------------------------------------------
  describe('readMessage', () => {
    it('should mark the message as read and broadcast the event', async () => {
      const readAt = new Date();
      const readMessage = { ...MESSAGE_STUB, readAt };
      mockMessageService.markAsRead.mockResolvedValueOnce(readMessage);

      const client = createMockSocket({ userId: 'user-2' });
      const dto = { messageId: 'msg-1' };

      await gateway.readMessage(client, dto);

      expect(mockMessageService.markAsRead).toHaveBeenCalledWith(
        'msg-1',
        'user-2',
      );

      expect((gateway as any).server.to).toHaveBeenCalledWith(
        'conversation:conv-1',
      );
      expect((gateway as any).server.emit).toHaveBeenCalledWith('message:read', {
        messageId: 'msg-1',
        userId: 'user-2',
        readAt,
      });
    });
  });
});
