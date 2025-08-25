import { AlexResponse, Conversation, Message } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003';

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
      
      if (response.response) {
        onChunk(response.response);
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

  async getConversations(): Promise<Conversation[]> {
    return [];
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    return;
  }

  async deleteConversation(id: string): Promise<void> {
    return;
  }

  async getHealth(): Promise<{ status: string; alex: any }> {
    return this.request('/api/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;