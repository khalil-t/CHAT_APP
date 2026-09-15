/**
 * Core domain types for the chat application
 */

import type { Dispatch, SetStateAction } from 'react'

export type User = {
  id: string
  name?: string
  avatar?: string
  email?: string
  onlineStatus?: 'online' | 'offline' | 'away'
}

export type UserSearchResponse = User[] | { users?: User[]; data?: User[] }

export type Message = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  updatedAt?: string
  readAt?: string | null
  deliveredAt?: string | null
}

export type Conversation = {
  id: string
  name?: string
  participantIds: string[]
  participants?: User[]
  lastMessage?: Message
  lastMessageAt?: string
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export type ConversationWithDetails = Conversation & {
  participants: User[]
  lastMessage?: Message
}

export type SignInResponse = {
  accessToken: string
}

export type ApiUser = {
  id: string
  email: string
  createdAt: string
}

export type ApiConversation = {
  id: string
  userId: string
  title: string
  role: string
  createdAt: string
  joined_at: string | null
}

export type ApiMessage = {
  id: string
  conversationId: string | null
  senderId: string
  content: string
  sentAt: string
  readAt: string | null
  sender?: ApiUser
}

export type RealtimeMessage = {
  messageId: string
  conversationId: string
  senderId: string
  content: string
  readAt: string | null
}

export type SocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

export type ChatContextType = {
  currentUser: User | null
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, Message[]>
  unreadCounts: Record<string, number>
  socketStatus: SocketConnectionState
  composerValue: string
  isLoadingConversations: boolean
  isLoadingMessages: boolean
  error: string | null

  // Actions
  setCurrentUser: (user: User) => void
  setConversations: Dispatch<SetStateAction<Conversation[]>>
  setActiveConversationId: (id: string | null) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (message: Message) => void
  handleNewMessage: (raw: RealtimeMessage) => void
  setUnreadCounts: (counts: Record<string, number>) => void
  decrementUnreadCount: (conversationId: string) => void
  setSocketStatus: (status: SocketConnectionState) => void
  setComposerValue: (value: string) => void
  setIsLoadingConversations: (loading: boolean) => void
  setIsLoadingMessages: (loading: boolean) => void
  setError: (error: string | null) => void
}
