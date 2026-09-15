import type {
  User,
  Conversation,
  Message,
  ApiUser,
  ApiConversation,
  ApiMessage,
  RealtimeMessage,
  SignInResponse,
} from './chat-types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

async function getError(response: Response, fallback: string) {
  try {
    const payload = await response.json()
    if (typeof payload?.message === 'string') return payload.message
    if (Array.isArray(payload?.message)) return payload.message.join(', ')
  } catch { /* Response may not contain JSON. */ }
  return fallback
}

export function normalizeUser(raw: ApiUser): User {
  return {
    id: raw.id,
    name: raw.email,
    email: raw.email,
    avatar: undefined,
    onlineStatus: undefined,
  }
}

export function normalizeMessage(raw: ApiMessage | RealtimeMessage): Message {
  return {
    id: 'id' in raw ? raw.id : raw.messageId,
    conversationId: raw.conversationId ?? '',
    senderId: raw.senderId,
    content: raw.content,
    createdAt: 'sentAt' in raw ? raw.sentAt : new Date().toISOString(),
    readAt: raw.readAt ?? null,
  }
}

function asMessage(raw: ApiMessage | RealtimeMessage): Message {
  return normalizeMessage(raw)
}

export const chatApi = {
  login: async (email: string, password: string): Promise<SignInResponse> => {
    const response = await fetch(`${API_URL}/auth/sign-in`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (!response.ok) throw new Error(await getError(response, 'Login failed'))
    return response.json()
  },
  register: async (email: string, password: string, passwordConfirm: string): Promise<void> => {
    const response = await fetch(`${API_URL}/auth/sign-up`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, passwordConfirm, created_at: new Date().toISOString() }) })
    if (!response.ok) throw new Error(await getError(response, 'Registration failed'))
  },
  getConversations: async (token: string): Promise<ApiConversation[]> => {
    const response = await fetch(`${API_URL}/conversations`, { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) throw new Error(await getError(response, 'Failed to fetch conversations'))
    return response.json()
  },
  getConversation: async (conversationId: string, token: string): Promise<ApiConversation> => {
    const response = await fetch(`${API_URL}/conversations/${conversationId}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) throw new Error(await getError(response, 'Failed to fetch conversation'))
    return response.json()
  },
  createConversation: async (targetUserId: string, token: string, title?: string): Promise<ApiConversation> => {
    const response = await fetch(`${API_URL}/conversations`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ targetUserId, title }) })
    if (!response.ok) throw new Error(await getError(response, 'Failed to start conversation'))
    return response.json()
  },
  searchUsers: async (query: string, token: string, page = 1, limit = 20): Promise<User[]> => {
    const params = new URLSearchParams({ search: query, page: String(page), limit: String(limit) })
    const response = await fetch(`${API_URL}/users?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) throw new Error(await getError(response, 'Unable to find users'))
    const payload = await response.json()
    const rawUsers = Array.isArray(payload) ? payload : payload.users ?? payload.data ?? []
    return rawUsers.map((raw: ApiUser) => normalizeUser(raw))
  },
  getMessages: async (conversationId: string, token: string): Promise<Message[]> => {
    const response = await fetch(`${API_URL}/messages?conversationId=${encodeURIComponent(conversationId)}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) throw new Error(await getError(response, 'Failed to fetch messages'))
    const payload = await response.json()
    const rawMessages = Array.isArray(payload) ? payload : payload.messages ?? payload.data ?? []
    return rawMessages.map((raw: ApiMessage) => normalizeMessage(raw))
  },
  createMessage: async (conversationId: string, content: string, token: string, senderId: string): Promise<Message> => {
    const response = await fetch(`${API_URL}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ conversationId, content, senderId }) })
    if (!response.ok) throw new Error(await getError(response, 'Failed to send message'))
    return asMessage(await response.json())
  },
  getCurrentUser: async (token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/user`, { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) throw new Error(await getError(response, 'Failed to fetch current user'))
    return normalizeUser(await response.json())
  },
  getUser: async (userId: string, token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) throw new Error(await getError(response, 'Failed to fetch user'))
    return normalizeUser(await response.json())
  },
}