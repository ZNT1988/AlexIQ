// API base URL configuration
const getApiBaseUrl = () => {
  // Check environment variables first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Production: use Railway API URL
  if (import.meta.env.PROD) {
    return 'https://api.alexiq.site';
  }
  
  // Development: use proxy (empty string lets proxy handle it)
  return '';
};

const API_BASE = getApiBaseUrl();

// Generic API fetch function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
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
      const errorText = await response.text().catch(() => '');
      throw new Error(`API ${response.status}: ${errorText || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Health check
export async function healthCheck() {
  return apiRequest('/health');
}

// Chat API
export async function chat(message: string) {
  return apiRequest('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

// Ideas API
export async function generateIdeas(prompt: string, preferences = {}) {
  return apiRequest('/api/ai/generate-ideas', {
    method: 'POST',
    body: JSON.stringify({ prompt, preferences }),
  });
}

// Export the API base URL for debugging
export const API_BASE_URL = API_BASE;