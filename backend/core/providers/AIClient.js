// AI Client avec vraies API Keys
import { callOpenAI } from '../../services/openai.js';
import { callAnthropic } from '../../services/anthropic.js';
import { callGemini } from '../../services/google.js';

export class AIClient {
  constructor() {
    this.providers = {
      openai: callOpenAI,
      anthropic: callAnthropic,
      google: callGemini
    };
  }

  async query(prompt, provider = 'openai') {
    try {
      const providerFunc = this.providers[provider];
      if (!providerFunc) {
        throw new Error(`Provider ${provider} non supporté`);
      }
      
      const response = await providerFunc(prompt);
      return {
        content: response,
        provider: provider,
        success: true
      };
    } catch (error) {
      return {
        content: `Erreur ${provider}: ${error.message}`,
        provider: provider,
        success: false,
        error: error.message
      };
    }
  }

  async queryMultiple(prompt) {
    const results = await Promise.allSettled([
      this.query(prompt, 'openai'),
      this.query(prompt, 'anthropic'),
      this.query(prompt, 'google')
    ]);

    return results.map((result, index) => {
      const providers = ['openai', 'anthropic', 'google'];
      return {
        provider: providers[index],
        ...(result.status === 'fulfilled' ? result.value : { success: false, error: result.reason })
      };
    });
  }
}

export default new AIClient();