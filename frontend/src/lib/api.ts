// Alex IQ API - Authentic AI Backend Connection
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.alexiq.site';

console.log('🔗 Alex API Base URL:', API_BASE);

// Generic API fetch function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Alex API ${response.status}: ${errorText || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`🚨 Alex API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Alex Health Check
export async function healthCheck() {
  return apiRequest('/health');
}

// Alex Chat API - Main AI Conversation
export async function chat(body: { message?: string; text?: string; prompt?: string }) {
  const message = body.message || body.text || body.prompt;
  if (!message) throw new Error('Message is required');
  
  return apiRequest('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

// Alex Image Generation (DALL-E)
export async function generateImage(prompt: string, options: { size?: string; style?: string } = {}) {
  return apiRequest('/api/images', {
    method: 'POST',
    body: JSON.stringify({ 
      prompt, 
      size: options.size || '1024x1024',
      style: options.style || 'vivid'
    }),
  });
}

// Alex Status and Memory Monitoring
export async function getStatus() {
  return apiRequest('/version');
}

export async function getMemoryStats() {
  return apiRequest('/admin/memory');
}

// Enable Alex AI Modules (when ready)
export async function enableAIModules() {
  return apiRequest('/admin/enable-ai', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

// Export API base for components
export const API_BASE_URL = API_BASE;

// Default export with all methods
export default {
  health: healthCheck,
  chat,
  generateImage,
  getStatus,
  getMemoryStats,
  enableAIModules,
};