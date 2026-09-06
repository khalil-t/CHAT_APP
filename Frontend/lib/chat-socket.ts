/**
 * Centralized Socket.IO client for real-time messaging
 * Handles connection, authentication, and event listening
 */

import { io, Socket } from 'socket.io-client'
import type { Message } from './chat-types'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

let socketInstance: Socket | null = null

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
          console.log('[v0] Socket connected')
          resolve()
        })

        socketInstance.on('connect_error', (error) => {
          console.error('[v0] Socket connection error:', error)
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
      socketInstance.emit('join', { conversationId })
    }
  },

  /**
   * Leave a conversation room
   */
  leaveRoom: (conversationId: string): void => {
    if (socketInstance?.connected) {
      socketInstance.emit('leave', { conversationId })
    }
  },

  /**
   * Listen for new messages
   */
  onNewMessage: (callback: (message: Message) => void): void => {
    if (socketInstance) {
      socketInstance.on('message:new', (message: Message) => {
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
