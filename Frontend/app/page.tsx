'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageCircle, Moon, Sun, Wifi, WifiOff } from 'lucide-react'
import { ChatProvider, useChat } from '@/lib/chat-context'
import { ConversationList } from '@/components/chat/conversation-list'
import { UserDiscovery } from '@/components/chat/user-discovery'
import { ChatHeader } from '@/components/chat/chat-header'
import { MessageList } from '@/components/chat/message-list'
import { MessageComposer } from '@/components/chat/message-composer'
import { InfoPanel } from '@/components/chat/info-panel'
import { AuthScreen } from '@/components/auth-screen'
import { chatSocket } from '@/lib/chat-socket'
import { chatApi, normalizeMessage } from '@/lib/chat-api'
import type { Conversation, User, ApiConversation, RealtimeMessage } from '@/lib/chat-types'

function normalizeConversation(conv: ApiConversation): Conversation {
  return {
    id: conv.id,
    name: conv.title || 'New chat',
    participantIds: conv.userId ? [conv.userId] : [],
    participants: [],
    lastMessage: undefined,
    lastMessageAt: conv.createdAt,
    unreadCount: 0,
    createdAt: String(conv.createdAt ?? new Date().toISOString()),
    updatedAt: String(conv.createdAt ?? new Date().toISOString()),
  }
}

function ChatApp() {
  const { conversations, setConversations, activeConversationId, setActiveConversationId, messages, setMessages, addMessage, setUnreadCounts, setSocketStatus, socketStatus, composerValue, setComposerValue, currentUser, setCurrentUser, isLoadingConversations, setIsLoadingConversations, isLoadingMessages, setIsLoadingMessages, error, setError } = useChat()
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [showDiscovery, setShowDiscovery] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const token = window.sessionStorage.getItem('accessToken')
    if (!token) return setSocketStatus('disconnected')
    ;(async () => { setError(null); setIsLoadingConversations(true); try { const user = await chatApi.getCurrentUser(token); const raw = await chatApi.getConversations(token, user.id); const normalized = raw.map((conv) => normalizeConversation(conv)); setCurrentUser(user); setConversations(normalized); setUnreadCounts(Object.fromEntries(normalized.map((conv) => [conv.id, 0]))); setSocketStatus('connecting'); await chatSocket.connect(token); setSocketStatus('connected') } catch { setSocketStatus('error'); setError('Could not load your conversations') } finally { setIsLoadingConversations(false) } })()
    const handleConnect = () => setSocketStatus('connected'); const handleDisconnect = () => setSocketStatus('reconnecting'); const handleNewMessage = (raw: RealtimeMessage) => { const message = normalizeMessage(raw); addMessage(message); setConversations((prev) => prev.map((conv) => conv.id === message.conversationId ? { ...conv, lastMessage: message, lastMessageAt: message.createdAt, updatedAt: message.createdAt } : conv)) }
    chatSocket.on('connect', handleConnect); chatSocket.on('disconnect', handleDisconnect); chatSocket.onNewMessage(handleNewMessage)
    return () => { chatSocket.off('connect'); chatSocket.off('disconnect'); chatSocket.off('message:new'); chatSocket.disconnect() }
  }, [addMessage, setConversations, setCurrentUser, setSocketStatus, setUnreadCounts, setError, setIsLoadingConversations])

  useEffect(() => { document.documentElement.classList.toggle('dark', isDark) }, [isDark])
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) || null
  const users = useMemo(() => new Map(), [])
  const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('accessToken') : null
  const searchUsers = useCallback((query: string) => chatApi.searchUsers(query, token || ''), [token])
  const selectConversation = (id: string) => { setActiveConversationId(id); setMobileView('chat'); setShowDiscovery(false); setConversations(conversations.map((conv) => conv.id === id ? { ...conv, unreadCount: 0 } : conv)) }
  const startConversation = async (user: User) => { if (!token || !currentUser) return; try { const created = await chatApi.createConversation(currentUser.id, token, user.name || user.email); const conversation = normalizeConversation(created); const next = [conversation, ...conversations.filter((item) => item.id !== conversation.id)]; setConversations(next); setActiveConversationId(conversation.id); setShowDiscovery(false); setMobileView('chat') } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not start conversation') } }

  useEffect(() => { if (!activeConversationId || !token) return; chatSocket.joinRoom(activeConversationId); let mounted = true; setError(null); setIsLoadingMessages(true); chatApi.getMessages(activeConversationId, token).then((msgs) => mounted && setMessages(activeConversationId, msgs)).catch(() => mounted && setError('Could not load messages')).finally(() => mounted && setIsLoadingMessages(false)); return () => { mounted = false; chatSocket.leaveRoom(activeConversationId) } }, [activeConversationId, setMessages, token, setError, setIsLoadingMessages])
  const sendMessage = async () => { if (!activeConversationId || !composerValue.trim() || isSending || !currentUser || !token) return; const content = composerValue.trim(); setComposerValue(''); setIsSending(true); try { addMessage(await chatApi.createMessage(activeConversationId, content, token, currentUser.id)) } catch { setComposerValue(content) } finally { setIsSending(false) } }
  const statusLabel = socketStatus === 'connected' ? 'Connected' : socketStatus === 'reconnecting' ? 'Reconnecting' : 'Offline'
  const currentUserInitial = currentUser?.name?.[0] ?? currentUser?.email?.[0]?.toUpperCase() ?? 'Y'

  return <main className="min-h-screen bg-background p-0 text-foreground md:p-4 lg:p-6"><div className="mx-auto flex h-screen max-h-[920px] max-w-[1500px] flex-col overflow-hidden border border-border bg-card shadow-2xl md:h-[calc(100vh-2rem)] md:rounded-2xl lg:h-[calc(100vh-3rem)]"><header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><MessageCircle className="size-5" /></div><div><p className="font-semibold tracking-tight">Relay</p><p className="hidden text-xs text-muted-foreground sm:block">Real-time conversations</p></div></div><div className="flex items-center gap-3"><div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">{socketStatus === 'connected' ? <Wifi className="size-3.5 text-emerald-500" /> : <WifiOff className="size-3.5" />}<span>{statusLabel}</span></div><button onClick={() => setIsDark((value) => !value)} className="rounded-lg p-2 hover:bg-muted" title="Toggle color theme" aria-label="Toggle color theme">{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button><div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{currentUserInitial}</div></div></header><div className="flex min-h-0 flex-1"><aside className={`${mobileView === 'chat' ? 'hidden md:block' : 'block'} w-full shrink-0 md:w-72 lg:w-80`}>{showDiscovery ? <UserDiscovery currentUser={currentUser} onBack={() => setShowDiscovery(false)} onStartConversation={startConversation} searchUsers={searchUsers} /> : <ConversationList conversations={conversations} activeConversationId={activeConversationId} onSelectConversation={selectConversation} onNewConversation={() => setShowDiscovery(true)} isLoading={isLoadingConversations} />}</aside><section className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} min-w-0 flex-1 flex-col bg-background`}>{activeConversation ? <>{error ? <div role="alert" className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">{error}</div> : null}<ChatHeader conversation={activeConversation} onBack={() => setMobileView('list')} /><MessageList messages={messages[activeConversation.id] || []} currentUserId={currentUser?.id || ''} users={users} isLoading={isLoadingMessages} /><MessageComposer value={composerValue} onChange={setComposerValue} onSend={sendMessage} isLoading={isSending} /></> : <div className="flex flex-1 items-center justify-center p-8"><div className="text-center"><MessageCircle className="mx-auto mb-4 size-14 rounded-2xl bg-muted p-4 text-muted-foreground" /><h2 className="font-semibold">Select a conversation</h2><p className="mt-1 text-sm text-muted-foreground">Choose a conversation to start messaging.</p></div></div>}</section><InfoPanel conversation={activeConversation} /></div></div></main>
}

export default function Page() { const [showChat, setShowChat] = useState(false); if (!showChat) return <AuthScreen onContinue={() => setShowChat(true)} />; return <ChatProvider><ChatApp /></ChatProvider> }
export type { Conversation }
