import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL = process.env.SOCKET_URL;

if (!SOCKET_URL) {
  throw new Error('SOCKET_URL environment variable is required');
}

export function getSocket(accessToken: string): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/realtime`, {
      transports: ['websocket'],

      autoConnect: false,

      auth: {
        token: accessToken,
      },
    });
  }

  return socket;
}
