'use client'

import React from 'react'
import { X } from 'lucide-react'
import type { Conversation } from '@/lib/chat-types'

interface InfoPanelProps {
  conversation: Conversation | null
  onClose?: () => void
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ conversation, onClose }) => {
  if (!conversation) {
    return (
      <div className="hidden lg:flex w-64 border-l border-border bg-background flex-col items-center justify-center p-4">
        <p className="text-muted-foreground text-sm text-center">Select a conversation to view details</p>
      </div>
    )
  }

  return (
    <div className="hidden lg:flex w-64 border-l border-border bg-background flex-col">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold text-foreground">Details</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Participants */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Participants
          </h4>
          <div className="space-y-2">
            {conversation.participants?.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  {participant.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{participant.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {participant.onlineStatus === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation info */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            About
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-foreground">
                {new Date(conversation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
