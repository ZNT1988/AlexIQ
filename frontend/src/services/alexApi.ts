const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003';

export interface AlexResponse {
  response: string;
  confidence: number;
  source: string;
  domain?: string;
  learningGained?: number;
  timestamp: string;
}

export interface StreamResponse {
  content: string;
  done: boolean;
  error?: string;
}

class AlexAPIService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async sendMessage(message: string): Promise<AlexResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          provider: 'anthropic',
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Alex API Error:', error);
      throw error;
    }
  }

  async *streamMessage(message: string): AsyncGenerator<StreamResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          provider: 'anthropic',
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream API Error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            yield { content: '', done: true };
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                yield { content: '', done: true };
                return;
              }

              try {
                const parsed = JSON.parse(data);
                yield { content: parsed.content || '', done: false };
              } catch (parseError) {
                console.warn('Failed to parse stream data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Stream Error:', error);
      yield { 
        content: '', 
        done: true, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const alexAPI = new AlexAPIService();