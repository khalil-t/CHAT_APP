/**
 * Mock data for UI demonstration and testing
 * This is isolated from the real API layer and should be replaced with actual backend calls
 */

import type { User, Conversation, Message } from './chat-types'

export const MOCK_CURRENT_USER: User = {
  id: 'user-1',
  name: 'You',
  email: 'you@example.com',
  onlineStatus: 'online',
}

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'You',
    email: 'you@example.com',
    onlineStatus: 'online',
  },
  {
    id: 'user-2',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    onlineStatus: 'online',
  },
  {
    id: 'user-3',
    name: 'Bob Smith',
    email: 'bob@example.com',
    onlineStatus: 'offline',
  },
  {
    id: 'user-4',
    name: 'Carol White',
    email: 'carol@example.com',
    onlineStatus: 'away',
  },
  {
    id: 'user-5',
    name: 'David Brown',
    email: 'david@example.com',
    onlineStatus: 'online',
  },
]

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-2',
    content: 'Hey! How are you doing?',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-1',
    content: "I'm doing great! Just working on this chat app. How about you?",
    createdAt: new Date(Date.now() - 3300000).toISOString(),
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-2',
    content: 'That sounds amazing! Can I check it out when it\'s done?',
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    senderId: 'user-1',
    content: 'Absolutely! I should have a working version ready next week.',
    createdAt: new Date(Date.now() - 2700000).toISOString(),
  },
  {
    id: 'msg-5',
    conversationId: 'conv-2',
    senderId: 'user-3',
    content: 'Did you get my email about the project deadline?',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'msg-6',
    conversationId: 'conv-2',
    senderId: 'user-1',
    content: 'Yes, I did! We\'re on track to finish by Friday.',
    createdAt: new Date(Date.now() - 6900000).toISOString(),
  },
  {
    id: 'msg-7',
    conversationId: 'conv-3',
    senderId: 'user-4',
    content: 'The design looks great! Any feedback?',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'msg-8',
    conversationId: 'conv-3',
    senderId: 'user-1',
    content: 'Love it! Just a couple of small tweaks needed.',
    createdAt: new Date(Date.now() - 10500000).toISOString(),
  },
]

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Alice Johnson',
    participantIds: ['user-1', 'user-2'],
    participants: [MOCK_USERS[0], MOCK_USERS[1]],
    lastMessage: MOCK_MESSAGES[3],
    lastMessageAt: MOCK_MESSAGES[3].createdAt,
    unreadCount: 0,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: MOCK_MESSAGES[3].createdAt,
  },
  {
    id: 'conv-2',
    name: 'Bob Smith',
    participantIds: ['user-1', 'user-3'],
    participants: [MOCK_USERS[0], MOCK_USERS[2]],
    lastMessage: MOCK_MESSAGES[5],
    lastMessageAt: MOCK_MESSAGES[5].createdAt,
    unreadCount: 2,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: MOCK_MESSAGES[5].createdAt,
  },
  {
    id: 'conv-3',
    name: 'Carol White',
    participantIds: ['user-1', 'user-4'],
    participants: [MOCK_USERS[0], MOCK_USERS[3]],
    lastMessage: MOCK_MESSAGES[7],
    lastMessageAt: MOCK_MESSAGES[7].createdAt,
    unreadCount: 0,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: MOCK_MESSAGES[7].createdAt,
  },
  {
    id: 'conv-4',
    name: 'David Brown',
    participantIds: ['user-1', 'user-5'],
    participants: [MOCK_USERS[0], MOCK_USERS[4]],
    unreadCount: 0,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
  },
]
