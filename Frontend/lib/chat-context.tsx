'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { normalizeMessage } from './chat-api'
import type {
  User,
  Conversation,
  Message,
  RealtimeMessage,
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
    setMessagesMap((prev) => {
      const existing = prev[conversationId] || []
      const knownIds = new Set(msgs.map((message) => message.id))
      const realtimeOnly = existing.filter((message) => !knownIds.has(message.id))
      return {
        ...prev,
        [conversationId]: [...msgs, ...realtimeOnly],
      }
    })
  }, [])

const addMessage = useCallback((message: Message) => {
  setMessagesMap((prev) => {
    const existing = prev[message.conversationId] || []

    console.log('[CHAT STATE] BEFORE ADD:', {
      conversationId: message.conversationId,
      existingMessages: existing,
      incomingMessage: message,
    })

    if (existing.some((item) => item.id === message.id)) {
      console.log('[CHAT STATE] DUPLICATE - NOT ADDING')
      return prev
    }

    const next = {
      ...prev,
      [message.conversationId]: [...existing, message],
    }

    console.log('[CHAT STATE] AFTER ADD:', next[message.conversationId])

    return next
  })
}, [])

  const handleNewMessage = useCallback((raw: RealtimeMessage) => {
    console.log('[CHAT] handleNewMessage called:', raw)

    const message = normalizeMessage(raw)

    console.log('[CHAT] normalized message:', message)

    addMessage(message)

    console.log('[CHAT] addMessage called')

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === message.conversationId
          ? {
              ...conv,
              lastMessage: message,
              lastMessageAt: message.createdAt,
              updatedAt: message.createdAt,
            }
          : conv
      )
    )
  }, [addMessage])

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
    handleNewMessage,
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
