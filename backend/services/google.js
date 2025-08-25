import { GoogleAuth } from 'google-auth-library';
import { VertexAI } from '@google-cloud/vertexai';

class GoogleService {
  constructor() {
    this.projectId = process.env.GOOGLE_PROJECT_ID || process.env.ID_PROJET_GOOGLE;
    this.location = process.env.GOOGLE_LOCATION || 'us-central1';
    this.model = process.env.GOOGLE_VERTEX_MODEL || 'gemini-1.5-pro';
    this.geminiApiKey = process.env.GOOGLE_API_KEY || process.env.CLÉ_API_GOOGLE;
    
    // Initialiser l'authentification Google
    this.initAuth();
    
    // Initialiser Vertex AI si les credentials sont disponibles
    if (this.projectId && this.hasValidCredentials()) {
      this.initVertexAI();
    }
  }

  initAuth() {
    try {
      const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
      
      if (credentialsJson) {
        // Parse le JSON des credentials
        const credentials = JSON.parse(credentialsJson);
        this.auth = new GoogleAuth({
          credentials,
          scopes: [
            'https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/generative-language'
          ]
        });
      } else {
        // Utiliser l'authentification par défaut
        this.auth = new GoogleAuth({
          scopes: [
            'https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/generative-language'
          ]
        });
      }
    } catch (error) {
      console.warn('⚠️ Google Auth initialization failed:', error.message);
      this.auth = null;
    }
  }

  initVertexAI() {
    try {
      this.vertexAI = new VertexAI({
        project: this.projectId,
        location: this.location
      });
      
      this.generativeModel = this.vertexAI.preview.getGenerativeModel({
        model: this.model,
        generation_config: {
          max_output_tokens: 2048,
          temperature: 0.7,
          top_p: 0.8,
        },
        safety_settings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });
    } catch (error) {
      console.warn('⚠️ Vertex AI initialization failed:', error.message);
      this.vertexAI = null;
      this.generativeModel = null;
    }
  }

  hasValidCredentials() {
    return !!(
      (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || 
       process.env.GOOGLE_APPLICATION_CREDENTIALS) &&
      this.projectId
    );
  }

  // Chat avec Vertex AI Gemini
  async chatWithVertexAI(message, context = []) {
    if (!this.generativeModel) {
      throw new Error('Vertex AI not initialized. Check Google Cloud credentials and project ID.');
    }

    try {
      // Construire le prompt avec le contexte
      const fullPrompt = this.buildPrompt(message, context);
      
      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      });

      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        content: text,
        provider: 'vertex-ai',
        model: this.model,
        usage: response.usageMetadata || {}
      };

    } catch (error) {
      console.error('❌ Vertex AI Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'vertex-ai'
      };
    }
  }

  // Chat avec Gemini API directe
  async chatWithGemini(message, context = []) {
    if (!this.geminiApiKey) {
      throw new Error('Google Gemini API key not configured');
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`;
      
      const fullPrompt = this.buildPrompt(message, context);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: fullPrompt }] 
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048
          }
        })
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return {
          success: true,
          content: data.candidates[0].content.parts[0].text,
          provider: 'gemini',
          model: 'gemini-pro',
          usage: data.usageMetadata || {}
        };
      } else {
        throw new Error(data.error?.message || 'No response from Gemini');
      }

    } catch (error) {
      console.error('❌ Gemini Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'gemini'
      };
    }
  }

  // Google Maps integration
  async getLocationInfo(query) {
    if (!this.geminiApiKey) {
      throw new Error('Google API key required for Maps integration');
    }

    try {
      // Utiliser Places API
      const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.geminiApiKey}`;
      
      const response = await fetch(placesUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.results?.length > 0) {
        const place = data.results[0];
        return {
          success: true,
          data: {
            name: place.name,
            address: place.formatted_address,
            location: place.geometry.location,
            rating: place.rating,
            types: place.types,
            place_id: place.place_id
          },
          provider: 'google-maps'
        };
      } else {
        throw new Error(data.error_message || 'No results found');
      }

    } catch (error) {
      console.error('❌ Google Maps Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'google-maps'
      };
    }
  }

  // Geocoding
  async geocode(address) {
    if (!this.geminiApiKey) {
      throw new Error('Google API key required for geocoding');
    }

    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.geminiApiKey}`;
      
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.results?.length > 0) {
        const result = data.results[0];
        return {
          success: true,
          data: {
            formatted_address: result.formatted_address,
            location: result.geometry.location,
            place_id: result.place_id,
            types: result.types
          },
          provider: 'google-geocoding'
        };
      } else {
        throw new Error(data.error_message || 'Geocoding failed');
      }

    } catch (error) {
      console.error('❌ Geocoding Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'google-geocoding'
      };
    }
  }

  buildPrompt(message, context = []) {
    let prompt = "";

    // Ajouter le contexte de conversation si disponible
    if (context.length > 0) {
      prompt += "Contexte de la conversation:\n";
      context.forEach(msg => {
        prompt += `${msg.role}: ${msg.content}\n`;
      });
      prompt += "\n";
    }

    // Instructions système
    prompt += `Tu es Alex, l'assistant IA créé par Zakaria Housni (ZNT) pour HustleFinder IA.
Tu es authentique, intelligent et tu aides les utilisateurs avec leurs projets business et leurs questions.
Réponds de manière naturelle, professionnelle et utile.

Message utilisateur: ${message}`;

    return prompt;
  }

  // Méthode principale pour choisir le meilleur service
  async chat(message, context = []) {
    // Essayer Vertex AI en premier (plus avancé)
    if (this.hasValidCredentials() && this.generativeModel) {
      const vertexResult = await this.chatWithVertexAI(message, context);
      if (vertexResult.success) {
        return vertexResult;
      }
    }

    // Fallback sur Gemini API
    if (this.geminiApiKey) {
      return await this.chatWithGemini(message, context);
    }

    throw new Error('No Google AI service available. Configure Google Cloud credentials or Gemini API key.');
  }

  // Status check
  getStatus() {
    return {
      vertex_ai: !!(this.hasValidCredentials() && this.generativeModel),
      gemini_api: !!this.geminiApiKey,
      maps_api: !!this.geminiApiKey,
      project_id: this.projectId,
      location: this.location,
      model: this.model
    };
  }
}

// Instance singleton
const googleService = new GoogleService();

export { googleService };
export default googleService;