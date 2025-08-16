import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Configuration des variables d'environnement
dotenv.config();

/**
 * Client AI unifié pour OpenAI, Anthropic et Google
 * Gère les trois APIs avec une interface commune
 */
export class UnifiedAIClient {
  constructor() {
    this.apiKeys = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY
    };
    
    this.endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      anthropic: 'https://api.anthropic.com/v1/messages',
      google: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
    };
    
    this.isHealthy = this.checkHealth();
  }

  /**
   * Vérifie la santé du client (clés API disponibles)
   */
  checkHealth() {
    const health = {};
    for (const [provider, key] of Object.entries(this.apiKeys)) {
      health[provider] = !!key;
    }
    return health;
  }

  /**
   * Appel OpenAI API
   */
  async callOpenAI(prompt, options = {}) {
    if (!this.apiKeys.openai) {
      throw new Error('Clé API OpenAI manquante');
    }

    const requestBody = {
      model: options.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7
    };

    const response = await fetch(this.endpoints.openai, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Pas de réponse OpenAI';
  }

  /**
   * Appel Anthropic Claude API
   */
  async callAnthropic(prompt, options = {}) {
    if (!this.apiKeys.anthropic) {
      throw new Error('Clé API Anthropic manquante');
    }

    const requestBody = {
      model: options.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 2000,
      messages: [{ role: 'user', content: prompt }]
    };

    const response = await fetch(this.endpoints.anthropic, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKeys.anthropic,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'Pas de réponse Anthropic';
  }

  /**
   * Appel Google Gemini API
   */
  async callGoogle(prompt, options = {}) {
    if (!this.apiKeys.google) {
      throw new Error('Clé API Google manquante');
    }

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2000
      }
    };

    const url = `${this.endpoints.google}?key=${this.apiKeys.google}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Pas de réponse Google';
  }

  /**
   * Interface unifiée pour tous les providers
   */
  async query(prompt, provider = 'openai', options = {}) {
    const startTime = Date.now();
    
    try {
      let response;
      
      switch (provider.toLowerCase()) {
        case 'openai':
          response = await this.callOpenAI(prompt, options);
          break;
        case 'anthropic':
        case 'claude':
          response = await this.callAnthropic(prompt, options);
          break;
        case 'google':
        case 'gemini':
          response = await this.callGoogle(prompt, options);
          break;
        default:
          throw new Error(`Provider '${provider}' non supporté`);
      }

      return {
        success: true,
        provider: provider,
        content: response,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        provider: provider,
        content: `Erreur ${provider}: ${error.message}`,
        error: error.message,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Requête vers plusieurs providers en parallèle
   */
  async queryMultiple(prompt, providers = ['openai', 'anthropic', 'google'], options = {}) {
    const promises = providers.map(provider => 
      this.query(prompt, provider, options)
    );

    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => ({
      provider: providers[index],
      ...(result.status === 'fulfilled' 
        ? result.value 
        : { 
            success: false, 
            error: result.reason?.message || 'Erreur inconnue',
            content: `Erreur lors de l'appel à ${providers[index]}`
          }
      )
    }));
  }

  /**
   * Méthode pour tester tous les providers
   */
  async testAllProviders() {
    const testPrompt = "Bonjour, peux-tu répondre simplement 'Test réussi' ?";
    return await this.queryMultiple(testPrompt);
  }

  /**
   * Obtenir le statut de santé détaillé
   */
  getHealthStatus() {
    return {
      healthy: this.isHealthy,
      providers: Object.keys(this.apiKeys).map(provider => ({
        name: provider,
        hasKey: !!this.apiKeys[provider],
        endpoint: this.endpoints[provider]
      })),
      timestamp: new Date().toISOString()
    };
  }
}

// Instance par défaut exportée
export default new UnifiedAIClient();