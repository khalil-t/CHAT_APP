import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RealtimeGateway, AuthenticatedSocket } from './realtime.gateway';

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
    leave: jest.fn().mockResolvedValue(undefined),
    userId: '',
    ...overrides,
  } as unknown as AuthenticatedSocket;
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockJwtService = {
  verify: jest.fn().mockReturnValue({ sub: 'user-1' }),
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
  // ping
  // -------------------------------------------------------------------------
  describe('handlePing', () => {
    it('should reply with pong', () => {
      const client = createMockSocket();

      gateway.handlePing(client);

      expect(client.emit).toHaveBeenCalledWith('pong', {
        message: 'Hello from NestJS',
      });
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
  // conversation:leave
  // -------------------------------------------------------------------------
  describe('leaveConversation', () => {
    it('should leave the conversation room and emit conversation:left', async () => {
      const client = createMockSocket({ userId: 'user-1' });

      await gateway.leaveConversation(client, { conversationId: 'conv-1' });

      expect(client.leave).toHaveBeenCalledWith('conversation:conv-1');
      expect(client.emit).toHaveBeenCalledWith('conversation:left', {
        conversationId: 'conv-1',
      });
    });
  });

  // -------------------------------------------------------------------------
  // deliverMessage
  // -------------------------------------------------------------------------
  describe('deliverMessage', () => {
    it('should broadcast the message to the conversation room', () => {
      const message = {
        messageId: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Hello!',
        readAt: null,
      };

      gateway.deliverMessage(message);

      expect((gateway as any).server.to).toHaveBeenCalledWith(
        'conversation:conv-1',
      );
      expect((gateway as any).server.emit).toHaveBeenCalledWith(
        'message:new',
        message,
      );
    });
  });
});