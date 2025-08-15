import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
  isDeleted?: boolean;
}

interface ChatState {
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // UI State
  sidebarOpen: boolean;
  searchQuery: string;
  isLoading: boolean;
  
  // Actions
  createConversation: () => string;
  setCurrentConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteConversation: (id: string) => void;
  pinConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  
  // Filtered data
  getFilteredConversations: () => Conversation[];
  getCurrentConversation: () => Conversation | null;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      currentConversationId: null,
      sidebarOpen: true,
      searchQuery: '',
      isLoading: false,

      // Actions
      createConversation: () => {
        const id = crypto.randomUUID();
        const newConversation: Conversation = {
          id,
          title: 'Nouvelle conversation',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }));
        
        return id;
      },

      setCurrentConversation: (id: string) => {
        set({ currentConversationId: id });
      },

      addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  updatedAt: new Date(),
                  title: conv.messages.length === 0 && message.type === 'user' 
                    ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                    : conv.title
                }
              : conv
          ),
        }));
      },

      updateMessage: (conversationId: string, messageId: string, content: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, content } : msg
                  ),
                  updatedAt: new Date(),
                }
              : conv
          ),
        }));
      },

      deleteConversation: (id: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, isDeleted: true } : conv
          ),
          currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
        }));
      },

      pinConversation: (id: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, isPinned: !conv.isPinned } : conv
          ),
        }));
      },

      updateConversationTitle: (id: string, title: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv
          ),
        }));
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Computed
      getFilteredConversations: () => {
        const { conversations, searchQuery } = get();
        const activeConversations = conversations.filter(conv => !conv.isDeleted);
        
        if (!searchQuery.trim()) {
          return activeConversations;
        }
        
        return activeConversations.filter(conv =>
          conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.messages.some(msg => 
            msg.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      },

      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get();
        return conversations.find(conv => conv.id === currentConversationId) || null;
      },
    }),
    {
      name: 'alex-chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);