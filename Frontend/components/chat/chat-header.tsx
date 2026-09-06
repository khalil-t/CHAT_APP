'use client'

import React from 'react'
import { ChevronLeft, Phone, Video, MoreVertical } from 'lucide-react'
import type { Conversation, User } from '@/lib/chat-types'

interface ChatHeaderProps {
  conversation: Conversation
  onBack?: () => void
  onMenuClick?: () => void
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onBack, onMenuClick }) => {
  const otherParticipant = conversation.participants?.[1]

  return (
    <div className="border-b border-border bg-background px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="font-semibold text-foreground truncate">{conversation.name}</h2>
          {otherParticipant && (
            <p className="text-xs text-muted-foreground">
              {otherParticipant.onlineStatus === 'online' ? 'Online' : 'Offline'}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
          title="Call"
        >
          <Phone className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
          title="Video call"
        >
          <Video className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          onClick={onMenuClick}
          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
          title="Menu"
        >
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
