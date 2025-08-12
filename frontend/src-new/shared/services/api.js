
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_POST = 'POST';

// API service for HustleFinderIA frontend
const logger = {
  info: (msg, ...args) => console.log(`[${new Date().toISOString()}] INFO:', msg, ...args)
  warn: (msg, ...args) => console.warn('[${new Date().toISOString()}] WARN:', msg, ...args)
  error: (msg, ...args) => console.error('[${new Date().toISOString()}] ERROR:', msg, ...args)
  debug: (msg, ...args) => console.debug('[${new Date().toISOString()}] DEBUG:`, msg, ...args)
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json'
        ...options.headers
      }
      timeout: API_TIMEOUT
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async health() {
    return this.request('/health');
  }

  // Ideas API
  async getIdeas(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/ideas${query ? '${?${query}}' : ''}`);
  }

  async createIdea(ideaData) {
    return this.request('/api/ideas', {
      method: STR_POST
      body: JSON.stringify(ideaData)
    });
  }

  async updateIdea(id, ideaData) {
    return this.request(`/api/ideas/${id}`, {
      method: 'PUT'
      body: JSON.stringify(ideaData)
    });
  }

  async deleteIdea(id) {
    return this.request(`/api/ideas/${id}`, {
      method: 'DELETE'
    });
  }

  // Projects API
  async getProjects(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/projects${query ? '${?${query}}' : ''}`);
  }

  async createProject(projectData) {
    return this.request('/api/projects', {
      method: STR_POST
      body: JSON.stringify(projectData)
    });
  }

  // ROI API
  async getROICalculations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/roi${query ? '${?${query}}' : ''}`);
  }

  async createROICalculation(roiData) {
    return this.request('/api/roi', {
      method: STR_POST
      body: JSON.stringify(roiData)
    });
  }

  // AI API
  async chatWithAI(message, type = 'chat', context = {}) {
    return this.request('/api/ai/chat', {
      method: STR_POST
      body: JSON.stringify({ message, type, context })
    });
  }

  async generateIdeas(prompt, preferences = {}) {
    return this.request('/api/ai/generate-ideas', {
      method: STR_POST
      body: JSON.stringify({ prompt, preferences })
    });
  }

  async analyzeMarket(data) {
    return this.request('/api/ai/market-analysis', {
      method: STR_POST
      body: JSON.stringify(data)
    });
  }
}

export default new APIService();