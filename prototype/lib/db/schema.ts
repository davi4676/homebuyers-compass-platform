/**
 * Database schema types for chatbots, documents, conversations, and analytics.
 * Use these types with your ORM (Prisma, Drizzle, etc.) or API layer.
 * No runtime DB dependency—schema only.
 */

// --- Chatbots ---
export interface Chatbot {
  id: string
  name: string
  slug: string
  description?: string
  systemPrompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
  knowledgeBaseId?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// --- Documents (Knowledge Base) ---
export interface Document {
  id: string
  knowledgeBaseId: string
  name: string
  type: string
  size: number
  url?: string
  status: 'pending' | 'processing' | 'ready' | 'failed'
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface KnowledgeBase {
  id: string
  name: string
  chatbotId?: string
  documentCount: number
  createdAt: string
  updatedAt: string
}

// --- Conversations ---
export interface Conversation {
  id: string
  chatbotId: string
  userId?: string
  title?: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}

// --- Analytics ---
export interface AnalyticsEvent {
  id: string
  type: string
  chatbotId?: string
  conversationId?: string
  userId?: string
  payload?: Record<string, unknown>
  createdAt: string
}

export interface ChatbotAnalytics {
  chatbotId: string
  period: string
  conversationsCount: number
  messagesCount: number
  uniqueUsers: number
  avgMessagesPerConversation: number
}
