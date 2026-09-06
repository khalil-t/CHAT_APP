'use client'

import React, { useState } from 'react'
import { Send, Plus } from 'lucide-react'

interface MessageComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isLoading?: boolean
  disabled?: boolean
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  value,
  onChange,
  onSend,
  isLoading = false,
  disabled = false,
}) => {
  const [rows, setRows] = useState(1)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for IME composition to avoid submitting during Chinese/Japanese input
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled && !isLoading) {
        onSend()
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    // Auto-adjust textarea height
    setRows(Math.min(4, (e.target.value.match(/\n/g) || []).length + 1))
  }

  const canSend = value.trim().length > 0 && !disabled && !isLoading

  return (
    <div className="border-t border-border bg-background p-4 space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Attach file"
        >
          <Plus className="w-5 h-5 text-muted-foreground" />
        </button>
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={rows}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 resize-none px-4 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        />
        <button
          onClick={onSend}
          disabled={!canSend || isLoading}
          className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
            canSend
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground px-4">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Enter</kbd> to send,{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Shift + Enter</kbd> for new line
      </p>
    </div>
  )
}
