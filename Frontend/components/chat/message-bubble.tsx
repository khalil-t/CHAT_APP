'use client'

import React from 'react'

function relativeTime(timestamp: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface MessageBubbleProps {
  content: string
  isOwn: boolean
  timestamp: string
  deliveredAt?: string | null
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  isOwn,
  timestamp,
  deliveredAt,
}) => {
    console.log('[MESSAGE BUBBLE] render:', {
    content,
    isOwn,
    timestamp,
    deliveredAt,
  })

  const timeAgo = relativeTime(timestamp)

  return (
    <div className={`flex gap-3 mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          isOwn
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted text-foreground rounded-tl-none'
        }`}
      >
        <p className="break-words text-sm leading-5">{content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {timeAgo}
          </span>
          {isOwn && deliveredAt && (
            <span className="text-xs text-primary-foreground/70">✓</span>
          )}
        </div>
      </div>
    </div>
  )
}
