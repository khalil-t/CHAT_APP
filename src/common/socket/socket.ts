import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(accessToken: string): Socket {
  if (!socket) {
    socket = io(`${process.env.SOCKET_URL || 'http://localhost:3001'}/realtime`, {
      transports: ['websocket'],

      autoConnect: false,

      auth: {
        token: accessToken,
      },
    });
  }

  return socket;
}
