export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  pinned?: boolean;
  deletedAt?: number | null;
  messages: Message[];
  updatedAt: number;
  createdAt: number;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  searchQuery: string;
  sidebarCollapsed: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AlexResponse {
  response: string;
  confidence: number;
  domain: string;
  source: string;
  palier2?: {
    memoriesUsed: number;
    decisionConfidence: number;
    decisionType: string;
  };
  palier3?: {
    primaryEmotion: string;
    emotionalValence: number;
    empathyScore: number;
    hasCreativeInsight: boolean;
    responseStrategy: string;
  };
  timestamp: string;
}