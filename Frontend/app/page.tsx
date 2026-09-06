'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Moon, Sun, Wifi, WifiOff } from 'lucide-react'
import { ChatProvider, useChat } from '@/lib/chat-context'
import { MOCK_CONVERSATIONS, MOCK_CURRENT_USER, MOCK_MESSAGES, MOCK_USERS } from '@/lib/mock-data'
import { ConversationList } from '@/components/chat/conversation-list'
import { ChatHeader } from '@/components/chat/chat-header'
import { MessageList } from '@/components/chat/message-list'
import { MessageComposer } from '@/components/chat/message-composer'
import { InfoPanel } from '@/components/chat/info-panel'
import { AuthScreen } from '@/components/auth-screen'
import { chatSocket } from '@/lib/chat-socket'
import type { Conversation, Message } from '@/lib/chat-types'

function ChatApp() {
  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    setMessages,
    addMessage,
    setUnreadCounts,
    setSocketStatus,
    socketStatus,
    composerValue,
    setComposerValue,
    currentUser,
    setCurrentUser,
  } = useChat()
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [isSending, setIsSending] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setCurrentUser(MOCK_CURRENT_USER)
    setConversations(MOCK_CONVERSATIONS)
    setUnreadCounts(Object.fromEntries(MOCK_CONVERSATIONS.map((conversation) => [conversation.id, conversation.unreadCount])))
    Object.values(MOCK_MESSAGES.reduce<Record<string, Message[]>>((acc, message) => {
      acc[message.conversationId] = [...(acc[message.conversationId] || []), message]
      return acc
    }, {})).forEach((group) => setMessages(group[0].conversationId, group))

    // When a token is available, this boundary connects to the NestJS realtime namespace.
    const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('accessToken') : null
    if (!token) {
      setSocketStatus('disconnected')
      return
    }

    setSocketStatus('connecting')
    chatSocket.connect(token).then(() => setSocketStatus('connected')).catch(() => setSocketStatus('error'))
    chatSocket.on('connect', () => setSocketStatus('connected'))
    chatSocket.on('disconnect', () => setSocketStatus('reconnecting'))
    chatSocket.onNewMessage((message) => {
      addMessage(message)
      setConversations((current) => current.map((conversation) => conversation.id === message.conversationId
        ? { ...conversation, lastMessage: message, lastMessageAt: message.createdAt, updatedAt: message.createdAt }
        : conversation))
    })

    return () => chatSocket.disconnect()
  }, [addMessage, setConversations, setCurrentUser, setMessages, setSocketStatus, setUnreadCounts])

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDark])

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) || null
  const users = useMemo(() => new Map(MOCK_USERS.map((user) => [user.id, user])), [])

  const selectConversation = (id: string) => {
    setActiveConversationId(id)
    setMobileView('chat')
    setConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, unreadCount: 0 } : conversation))
  }

  const sendMessage = async () => {
    if (!activeConversationId || !composerValue.trim() || isSending || !currentUser) return
    const content = composerValue.trim()
    setComposerValue('')
    setIsSending(true)

    // Preview fallback only; when authenticated, replace this with chatApi.createMessage.
    const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('accessToken') : null
    if (token) {
      try {
        const { chatApi } = await import('@/lib/chat-api')
        const message = await chatApi.createMessage(activeConversationId, content, token)
        addMessage(message)
      } catch {
        setComposerValue(content)
      }
    } else {
      const message: Message = {
        id: `demo-${Date.now()}`,
        conversationId: activeConversationId,
        senderId: currentUser.id,
        content,
        createdAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
      }
      addMessage(message)
      setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
        ? { ...conversation, lastMessage: message, lastMessageAt: message.createdAt, updatedAt: message.createdAt }
        : conversation))
    }
    setIsSending(false)
  }

  const statusLabel = socketStatus === 'connected' ? 'Connected' : socketStatus === 'reconnecting' ? 'Reconnecting' : 'Demo mode'

  return (
    <main className="min-h-screen bg-background text-foreground p-0 md:p-4 lg:p-6">
      <div className="mx-auto flex h-screen max-h-[920px] max-w-[1500px] flex-col overflow-hidden border border-border bg-card shadow-2xl md:h-[calc(100vh-2rem)] md:rounded-2xl lg:h-[calc(100vh-3rem)]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><MessageCircle className="h-5 w-5" /></div><div><p className="font-semibold tracking-tight">Relay</p><p className="hidden text-xs text-muted-foreground sm:block">Real-time conversations</p></div></div>
          <div className="flex items-center gap-3"><div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">{socketStatus === 'connected' ? <Wifi className="h-3.5 w-3.5 text-emerald-500" /> : <WifiOff className="h-3.5 w-3.5" />}<span>{statusLabel}</span></div><button onClick={() => setIsDark((value) => !value)} className="rounded-lg p-2 transition-colors hover:bg-muted" title="Toggle color theme" aria-label="Toggle color theme">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{currentUser?.name[0] || 'Y'}</div></div>
        </header>
        <div className="flex min-h-0 flex-1">
          <aside className={`${mobileView === 'chat' ? 'hidden md:block' : 'block'} w-full shrink-0 md:w-72 lg:w-80`}><ConversationList conversations={conversations} activeConversationId={activeConversationId} onSelectConversation={selectConversation} /></aside>
          <section className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} min-w-0 flex-1 flex-col bg-background`}>
            {activeConversation ? <><ChatHeader conversation={activeConversation} onBack={() => setMobileView('list')} /><MessageList messages={messages[activeConversation.id] || []} currentUserId={currentUser?.id || ''} users={users} /><MessageComposer value={composerValue} onChange={setComposerValue} onSend={sendMessage} isLoading={isSending} /></> : <div className="flex flex-1 items-center justify-center p-8"><div className="text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><MessageCircle className="h-6 w-6 text-muted-foreground" /></div><h2 className="font-semibold">Select a conversation</h2><p className="mt-1 text-sm text-muted-foreground">Choose a conversation to start messaging.</p></div></div>}
          </section>
          <InfoPanel conversation={activeConversation} />
        </div>
      </div>
    </main>
  )
}

export default function Page() {
  const [showChat, setShowChat] = useState(false)

  if (!showChat) return <AuthScreen onContinue={() => setShowChat(true)} />

  return <ChatProvider><ChatApp /></ChatProvider>
}

// Keep the conversation type imported in the public module for API consumers.
export type { Conversation }
