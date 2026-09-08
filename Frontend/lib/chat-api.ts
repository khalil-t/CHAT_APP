/**
 * Centralized API service layer for chat operations
 * All REST calls to the NestJS backend go through here
 */

import type { User, Conversation, Message } from './chat-types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const chatApi = {
  /**
   * Authentication endpoints
   */
  login: async (email: string, password: string): Promise<{ accessToken: string; user: User }> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) throw new Error('Login failed')
    return response.json()
  },

  register: async (
    email: string,
    password: string,
    name: string
  ): Promise<{ accessToken: string; user: User }> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) throw new Error('Registration failed')
    return response.json()
  },

  /**
   * Conversation endpoints
   */
  getConversations: async (token: string): Promise<Conversation[]> => {
    const response = await fetch(`${API_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to fetch conversations')
    return response.json()
  },

  getConversation: async (conversationId: string, token: string): Promise<Conversation> => {
    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to fetch conversation')
    return response.json()
  },

  createConversation: async (userId: string, title: string | undefined, token: string): Promise<Conversation> => {
    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, title }),
    })

    if (!response.ok) throw new Error('Failed to create conversation')
    return response.json()
  },

  /**
   * Message endpoints
   */
  getMessages: async (conversationId: string, token: string): Promise<Message[]> => {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to fetch messages')
    return response.json()
  },

  createMessage: async (
    conversationId: string,
    content: string,
    token: string,
    senderId?: string,
  ): Promise<Message> => {
    const body: Record<string, any> = { conversationId, content }
    if (senderId) body.senderId = senderId

    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) throw new Error('Failed to send message')
    return response.json()
  },

  /**
   * User endpoints
   */
  getCurrentUser: async (token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to fetch current user')
    return response.json()
  },

  getUser: async (userId: string, token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to fetch user')
    return response.json()
  },
}
