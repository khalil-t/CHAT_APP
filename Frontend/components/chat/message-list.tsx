'use client'

import React, { useEffect, useRef } from 'react'

function isSameDay(first: Date, second: Date) {
  return first.toDateString() === second.toDateString()
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
import { MessageBubble } from './message-bubble'
import type { Message, User } from '@/lib/chat-types'

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  users: Map<string, User>
  isLoading?: boolean
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  users,
  isLoading = false,
}) => {
  console.log('[MESSAGE LIST] render:', {
    count: messages.length,
    lastMessage: messages[messages.length - 1],
    isLoading,
  })

  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-4 w-full px-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`h-12 rounded-xl ${i % 2 === 0 ? 'w-32' : 'w-40'} bg-muted animate-pulse`}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">No messages yet</p>
          <p className="text-muted-foreground text-xs mt-1">Say hello 👋</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {messages.map((message, index) => {
        
        const showDateDivider =
          index === 0 || !isSameDay(new Date(messages[index - 1].createdAt), new Date(message.createdAt))
        const isOwnMessage = message.senderId === currentUserId

        return (
          <React.Fragment key={message.id}>
            {showDateDivider && (
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground px-2">
                  {formatDate(new Date(message.createdAt))}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <MessageBubble
              content={message.content}
              isOwn={isOwnMessage}
              timestamp={message.createdAt}
              deliveredAt={message.deliveredAt}
            />
          </React.Fragment>
        )
      })}
      <div ref={endRef} />
    </div>
  )
}
