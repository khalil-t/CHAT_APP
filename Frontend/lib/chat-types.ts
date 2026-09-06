/**
 * Core domain types for the chat application
 */

export type User = {
  id: string
  name: string
  avatar?: string
  email?: string
  onlineStatus?: 'online' | 'offline' | 'away'
}

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
  setConversations: (conversations: Conversation[]) => void
  setActiveConversationId: (id: string | null) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (message: Message) => void
  setUnreadCounts: (counts: Record<string, number>) => void
  decrementUnreadCount: (conversationId: string) => void
  setSocketStatus: (status: SocketConnectionState) => void
  setComposerValue: (value: string) => void
  setIsLoadingConversations: (loading: boolean) => void
  setIsLoadingMessages: (loading: boolean) => void
  setError: (error: string | null) => void
}
