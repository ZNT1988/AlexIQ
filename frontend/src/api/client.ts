import { AlexResponse, Conversation, Message } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.alexiq.site';

class ApiClient {
  private abortController: AbortController | null = null;

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async sendMessage(messages: Message[]): Promise<AlexResponse> {
    const lastMessage = messages[messages.length - 1];
    
    return this.request<AlexResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: lastMessage.content,
        conversation_id: crypto.randomUUID(),
        context: {
          previousMessages: messages.slice(-5) // Last 5 messages for context
        }
      }),
    });
  }

  async streamMessage(
    messages: Message[], 
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    this.abortController = new AbortController();
    
    try {
      const response = await this.sendMessage(messages);
      
      // Simulate streaming for now since Alex API doesn't support SSE yet
      const text = response.response;
      const words = text.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        if (this.abortController.signal.aborted) break;
        
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate typing
        onChunk(words.slice(0, i + 1).join(' '));
      }
      
      onComplete();
    } catch (error) {
      onError(error as Error);
    }
  }

  stopStreaming(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // Conversation CRUD (local for now, can be extended to API later)
  async getConversations(): Promise<Conversation[]> {
    // For now return empty array, will be handled by local storage
    return [];
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    // Local storage implementation will be in the store
    console.log('Saving conversation:', conversation.id);
  }

  async deleteConversation(id: string): Promise<void> {
    console.log('Deleting conversation:', id);
  }

  async getHealth(): Promise<{ status: string; alex: any }> {
    return this.request('/api/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;