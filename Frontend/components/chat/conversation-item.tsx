'use client'

import React from 'react'

function relativeTime(timestamp?: string) {
  if (!timestamp) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000))
  if (seconds < 60) return 'now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}
import type { Conversation } from '@/lib/chat-types'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const lastMessagePreview = conversation.lastMessage?.content.substring(0, 50) || 'No messages yet'
  const timeAgo = relativeTime(conversation.lastMessageAt)

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg transition-colors flex gap-3 text-left hover:bg-muted ${
        isActive ? 'bg-muted' : ''
      }`}
    >
      {/* Avatar placeholder */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
        {conversation.name?.[0]?.toUpperCase() || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-foreground truncate text-sm">{conversation.name}</h3>
          <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-1">{lastMessagePreview}</p>
      </div>
      {conversation.unreadCount > 0 && (
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center">
            {conversation.unreadCount}
          </div>
        </div>
      )}
    </button>
  )
}
