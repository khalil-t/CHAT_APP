/**
 * Centralized Socket.IO client for real-time messaging
 * Handles connection, authentication, and event listening
 */

import { io, Socket } from 'socket.io-client'
import type { RealtimeMessage } from './chat-types'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002'

let socketInstance: Socket | null = null
const pendingRooms = new Set<string>()

function emitJoin(conversationId: string) {
  socketInstance?.emit('conversation:join', { conversationId })
}

export const chatSocket = {
  /**
   * Initialize socket connection with JWT token
   */
  connect: (accessToken: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        socketInstance = io(`${SOCKET_URL}/realtime`, {
          auth: {
            token: accessToken,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        })

        socketInstance.on('connect', () => {
          console.log('[SOCKET] connected:', socketInstance?.id)
          console.log('[SOCKET] transport:', socketInstance?.io.engine.transport.name)

          pendingRooms.forEach(emitJoin)
          pendingRooms.clear()
          resolve()
        })

        socketInstance.on('disconnect', (reason) => {
          console.log('[SOCKET] disconnected:', reason)
        })

        socketInstance.on('connect_error', (error) => {
          console.error('[SOCKET] connection error:', error)
          reject(error)
        })
      } catch (error) {
        console.error('[v0] Failed to initialize socket:', error)
        reject(error)
      }
    })
  },

  /**
   * Disconnect socket
   */
  disconnect: (): void => {
    if (socketInstance) {
      socketInstance.disconnect()
      socketInstance = null
    }
  },

  /**
   * Join a conversation room
   */
  joinRoom: (conversationId: string): void => {
    if (socketInstance?.connected) {
      emitJoin(conversationId)
    } else {
      pendingRooms.add(conversationId)
    }
    
  },

  /**
   * Leave a conversation room
   */
  leaveRoom: (conversationId: string): void => {
    pendingRooms.delete(conversationId)
    if (socketInstance?.connected) {
      socketInstance.emit('conversation:leave', { conversationId })
    }
  },

  /**
   * Listen for new messages
   */
  onNewMessage: (callback: (message: RealtimeMessage) => void): void => {
    if (socketInstance) {
      socketInstance.on('message:new', (message: RealtimeMessage) => {
        console.log('[v0] Received new message:', message)
        callback(message)
      })
    }
  },

  /**
   * Remove message listener
   */
  offNewMessage: (): void => {
    if (socketInstance) {
      socketInstance.off('message:new')
    }
  },

  /**
   * Listen for socket events
   */
  on: (event: string, callback: (...args: any[]) => void): void => {
    if (socketInstance) {
      socketInstance.on(event, callback)
    }
  },

  /**
   * Remove event listener
   */
  off: (event: string): void => {
    if (socketInstance) {
      socketInstance.off(event)
    }
  },

  /**
   * Check if socket is connected
   */
  isConnected: (): boolean => {
    return socketInstance?.connected || false
  },

  /**
   * Get socket instance for direct access if needed
   */
  getInstance: (): Socket | null => {
    return socketInstance
  },


  
}
