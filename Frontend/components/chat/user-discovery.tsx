'use client'

import React, { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, MessageCircle, Search, UserRound } from 'lucide-react'
import type { User } from '@/lib/chat-types'

interface UserDiscoveryProps {
  currentUser: User | null
  onBack: () => void
  onStartConversation: (user: User) => Promise<void>
  searchUsers: (query: string) => Promise<User[]>
}

export function UserDiscovery({ currentUser, onBack, onStartConversation, searchUsers }: UserDiscoveryProps) {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const results = await searchUsers(query)
        setUsers(results.filter((user) => user.id !== currentUser?.id))
      } catch (cause) {
        setUsers([])
        setError(cause instanceof Error ? cause.message : 'Unable to find users')
      } finally {
        setIsLoading(false)
      }
    }, query.trim() ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [currentUser?.id, query, searchUsers])

  const handleStart = async () => {
    if (!selectedUser) return
    setIsStarting(true)
    try {
      await onStartConversation(selectedUser)
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-background">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <button onClick={onBack} className="rounded-lg p-2 hover:bg-muted" aria-label="Back to conversations">
          <ArrowLeft className="size-5" />
        </button>
        <div><h1 className="font-bold text-lg">New conversation</h1><p className="text-xs text-muted-foreground">Find someone to message</p></div>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people..." className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary" aria-label="Search people" />
        </div>
        <div className="flex min-h-0 flex-col gap-1 overflow-y-auto">
          {isLoading && [1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-muted" />)}
          {!isLoading && error && <p role="alert" className="p-4 text-center text-sm text-destructive">{error}</p>}
          {!isLoading && !error && users.length === 0 && <div className="flex flex-col items-center gap-2 p-8 text-center"><UserRound className="size-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{query ? 'No people found' : 'Search for a person to start chatting'}</p></div>}
          {!isLoading && users.map((user) => {
            const label = user.name || user.email || 'Unknown user'
            return <button key={user.id} onClick={() => setSelectedUser(user)} className={`flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted ${selectedUser?.id === user.id ? 'bg-primary/10 ring-1 ring-primary' : ''}`} aria-pressed={selectedUser?.id === user.id}><div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">{label[0]?.toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{label}</p>{user.name && user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}</div></button>
          })}
        </div>
        <button onClick={handleStart} disabled={!selectedUser || isStarting} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"><MessageCircle className="size-4" />{isStarting ? <><Loader2 className="size-4 animate-spin" />Starting...</> : 'Start conversation'}</button>
      </div>
    </div>
  )
}

export default UserDiscovery
