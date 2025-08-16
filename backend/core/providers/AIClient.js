/**
 * AIClient - Client IA AUTHENTIQUE avec vraies APIs
 * TRANSFORMÉ pour utiliser les vraies APIs Claude/ChatGPT/Google
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export class AIClient {
  constructor() {
    // Configuration des vraies APIs (seulement si clés disponibles)
    this.openai = null;
    this.anthropic = null;

    // Initialiser seulement si clés API disponibles
    if (process.env.OPENAI_API_KEY) {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
      } catch (error) {
        console.warn('Failed to initialize OpenAI client:', error.message);
      }
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        this.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });
      } catch (error) {
        console.warn('Failed to initialize Anthropic client:', error.message);
      }
    }

    this.providers = {
      openai: this.openai ? 'healthy' : 'disabled',
      anthropic: this.anthropic ? 'healthy' : 'disabled'
    };
  }

  async healthCheck() {
    return {
      status: 'healthy',
      providers: this.providers
    };
  }

  async query(prompt, options = {}) {
    const { provider = 'anthropic', temperature = 0.7 } = options;
    
    try {
      if (provider === 'anthropic' && this.anthropic) {
        // VRAIE API CLAUDE
        const response = await this.anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          temperature,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        return {
          content: response.content[0].text,
          model: 'claude-3-sonnet-20240229',
          usage: {
            prompt_tokens: response.usage.input_tokens,
            completion_tokens: response.usage.output_tokens,
            total_tokens: response.usage.input_tokens + response.usage.output_tokens
          }
        };
      }
      
      if (provider === 'openai' && this.openai) {
        // VRAIE API OPENAI
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          temperature,
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        return {
          content: response.choices[0].message.content,
          model: 'gpt-4',
          usage: response.usage
        };
      }

      // Fallback si pas d'API keys configurées
      return {
        content: `Alex n'a pas accès aux APIs externes actuellement. Les clés API ne sont pas configurées pour ${provider}.`,
        model: `${provider}-fallback`,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 50,
          total_tokens: 50
        }
      };

    } catch (error) {
      console.error(`AI API Error (${provider}):`, error);
      
      return {
        content: `Erreur temporaire de connexion avec ${provider}. Alex essaiera de vous répondre différemment.`,
        model: `${provider}-error`,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 30,
          total_tokens: 30
        }
      };
    }
  }
}

// Export singleton
const aiClient = new AIClient();
export default aiClient;