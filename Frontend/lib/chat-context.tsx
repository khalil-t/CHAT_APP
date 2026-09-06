'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type {
  User,
  Conversation,
  Message,
  SocketConnectionState,
  ChatContextType,
} from './chat-types'

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessagesMap] = useState<Record<string, Message[]>>({})
  const [unreadCounts, setUnreadCountsMap] = useState<Record<string, number>>({})
  const [socketStatus, setSocketStatus] = useState<SocketConnectionState>('disconnected')
  const [composerValue, setComposerValue] = useState('')
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setMessages = useCallback((conversationId: string, msgs: Message[]) => {
    setMessagesMap((prev) => ({
      ...prev,
      [conversationId]: msgs,
    }))
  }, [])

  const addMessage = useCallback((message: Message) => {
    setMessagesMap((prev) => ({
      ...prev,
      [message.conversationId]: [
        ...(prev[message.conversationId] || []),
        message,
      ],
    }))
  }, [])

  const setUnreadCounts = useCallback((counts: Record<string, number>) => {
    setUnreadCountsMap(counts)
  }, [])

  const decrementUnreadCount = useCallback((conversationId: string) => {
    setUnreadCountsMap((prev) => ({
      ...prev,
      [conversationId]: Math.max(0, (prev[conversationId] || 0) - 1),
    }))
  }, [])

  const value: ChatContextType = {
    currentUser,
    conversations,
    activeConversationId,
    messages,
    unreadCounts,
    socketStatus,
    composerValue,
    isLoadingConversations,
    isLoadingMessages,
    error,
    setCurrentUser,
    setConversations,
    setActiveConversationId,
    setMessages,
    addMessage,
    setUnreadCounts,
    decrementUnreadCount,
    setSocketStatus,
    setComposerValue,
    setIsLoadingConversations,
    setIsLoadingMessages,
    setError,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
