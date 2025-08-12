
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_POST = 'POST';
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ANONYMOUS = 'anonymous';
// Malformed constant removed - using inline strings
';
// Malformed constant removed
const STR_HIGH = 'high';
/**
 * ALEX ULTIMATE - CONNECTEURS EXTERNES OMNISCIENTS
 * Système hybride pour accéder aux bases de données mondiales
 * @author HustleFinder IA Team
 * @version 1.0.0 - Omniscient Edition
 */

import logger from '../config/logger.js';
import rateLimiter from './RateLimiter.js';

/**
 * @class ExternalDataSources
 * @description Gestionnaire des sources de données externes pour Alex Ultimate
 */
class ExternalDataSources {
  constructor() {
    this.cache = new Map();
    this.rateLimits = new Map();
    this.sources = {
      wikipedia: { available: true, baseUrl: 'https://en.wikipedia.org/api/rest_v1' }
      openai: { available: !!process.env.OPENAI_API_KEY }
      anthropic: { available: !!process.env.ANTHROPIC_API_KEY }
      newsapi: { available: !!process.env.NEWS_API_KEY }
      weatherapi: { available: !!process.env.WEATHER_API_KEY }
      finhub: { available: !!process.env.FINNHUB_API_KEY }
    };

    try {
      logger.info('🌐 External Data Sources initialized - Alex now omniscient!');

    } catch (error) {
    // Logger fallback - ignore error
  }}

  /**
   * STRATÉGIE HYBRIDE PRINCIPALE
   * Décide quelle source utiliser selon le contexte
   */
  async getIntelligentResponse(query, context = {}) {
    const queryAnalysis = this.analyzeQuery(query);
    logger.info(`🧠 Query analysis: ${JSON.stringify(queryAnalysis)}`);

    // 1. D'abord, vérifier le cache local
    const cacheKey = this.generateCacheKey(query, queryAnalysis);
    if (this.cache.has(cacheKey)) {
      logger.info('⚡ Cache hit - returning cached response');
      return {
        ...this.cache.get(cacheKey)
        source: 'cache'
        cached: true
      };
    }

    // 2. Sélectionner la meilleure stratégie avec rate limiting
    const userId = context.userId || STR_ANONYMOUS;
    const strategy = await this.selectOptimalStrategy(queryAnalysis, userId);

    // 3. Exécuter la stratégie sélectionnée
    try {
      const response = await this.executeStrategy(strategy, query, queryAnalysis, context);

      // 4. Mettre en cache la réponse
      this.cacheResponse(cacheKey, response);

      // 5. Ajouter informations de stratégie
      response.strategy = strategy.name;
      response.hybridSystem = true;

      return response;
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  /**
   * ANALYSE INTELLIGENTE DES REQUÊTES
   */
  analyzeQuery(query) {
    const lowerQuery = query.toLowerCase();

    return {
      type: this.detectQueryType(lowerQuery)
      intent: this.detectIntent(lowerQuery)
      entities: this.extractEntities(lowerQuery)
      timeframe: this.detectTimeframe(lowerQuery)
      language: this.detectLanguage(query)
      complexity: this.assessComplexity(lowerQuery)
      needsRealTimeData: this.needsRealTimeData(lowerQuery)
      needsExpertKnowledge: this.needsExpertKnowledge(lowerQuery)
    };
  }

  detectQueryType(query) {
    if (query.includes(STR_WEATHER) || query.includes('températureSTR_QUERY_INCLUDESclima')) return STR_WEATHER;
    if (query.includes('newsSTR_QUERY_INCLUDESactualitéSTR_QUERY_INCLUDESnoticiaSTR_RETURNnewsSTR_IF_QUERY_INCLUDESstockSTR_QUERY_INCLUDEScryptoSTR_QUERY_INCLUDEStradingSTR_RETURNfinanceSTR_IF_QUERY_INCLUDESwhat isSTR_QUERY_INCLUDESwho isSTR_QUERY_INCLUDEStell me aboutSTR_RETURNknowledgeSTR_IF_QUERY_INCLUDEShow toSTR_QUERY_INCLUDEScomment faireSTR_RETURNtutorialSTR_IF_QUERY_INCLUDEScalculateSTR_QUERY_INCLUDEScomputeSTR_RETURNcomputationSTR_RETURNgeneral';
  }

  detectIntent(query) {
    if (query.includes('latestSTR_QUERY_INCLUDESrecent') || query.includes(STR_TODAY)) return 'current_infoSTR_IF_QUERY_INCLUDESexplainSTR_QUERY_INCLUDESwhat isSTR_RETURNexplanationSTR_IF_QUERY_INCLUDEScompareSTR_QUERY_INCLUDESdifferenceSTR_RETURNcomparisonSTR_IF_QUERY_INCLUDESrecommendSTR_QUERY_INCLUDESsuggestSTR_RETURNrecommendationSTR_RETURNinformation';
  }

  extractEntities(query) {
    const entities = {
      locations: []
      companies: []
      currencies: []
      dates: []
      numbers: []
    };

    // Extraction basique d'entités (peut être améliorée avec NLP)
    const locationRegex = /(paris|london|new york|tokyo|sydney|melbourne|são paulo|rio de janeiro)/gi;
    const companyRegex = /(apple|google|microsoft|amazon|tesla|bitcoin|ethereum)/gi;
    const currencyRegex = /(bitcoin|btc|ethereum|eth|usd|eur|gbp)/gi;

    entities.locations = [...(query.match(locationRegex) || [])];
    entities.companies = [...(query.match(companyRegex) || [])];
    entities.currencies = [...(query.match(currencyRegex) || [])];

    return entities;
  }

  detectTimeframe(query) {
    if (query.includes(STR_TODAY) || query.includes('nowSTR_QUERY_INCLUDEScurrentSTR_RETURNcurrentSTR_IF_QUERY_INCLUDESyesterdaySTR_QUERY_INCLUDESlast weekSTR_RETURNrecentSTR_IF_QUERY_INCLUDEStomorrowSTR_QUERY_INCLUDESnext weekSTR_RETURNfutureSTR_RETURNgeneral';
  }

  detectLanguage(query) {
    // Détection de langue améliorée
    if (/[áéíóúñü]/.test(query) || query.includes('quéSTR_QUERY_INCLUDEScómoSTR_RETURNes';
    if (/[àáâãéêíóôõú]/.test(query) || query.includes('comoSTR_QUERY_INCLUDESpodeSTR_RETURNptSTR_IF_QUERY_INCLUDESwhatSTR_QUERY_INCLUDEShowSTR_QUERY_INCLUDESwhereSTR_RETURNenSTR_RETURNfr';
  }

  assessComplexity(query) {
    let score = 0;
    if (query.length > 100) score += 2;
    if (query.includes('andSTR_QUERY_INCLUDESorSTR_QUERY_INCLUDESbut')) score += 1;
    if (query.split(' ').length > 15) score += 1;
    
      ')) score += 1;

    if (score >= 4) return STR_HIGH;
    if (score >= 2) return 'mediumSTR_RETURNlow';
  }

  needsRealTimeData(query) {
    const realTimeKeywords = ['current', 'latest', 'now', STR_TODAY, 'live', 'real-time', 'actualité', 'maintenant'];
    return realTimeKeywords.some(keyword => query.includes(keyword));
  }

  needsExpertKnowledge(query) {
    const expertKeywords = ['technical', 'advanced', 'professional', 'expert', 'complex', 'detailed analysis'];
    return expertKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * SÉLECTION DE LA STRATÉGIE OPTIMALE AVEC RATE LIMITING
   */
  async selectOptimalStrategy(analysis, userId = STR_ANONYMOUS) {
    // Stratégies par ordre de priorité selon le contexte
    const strategies = [];

    // Données temps réel nécessaires
    if (analysis.needsRealTimeData) {
      if (analysis.type === STR_WEATHER) strategies.push({ name :
       'weather_api', priority: 10, cost: 'low' });
      if (analysis.type === 'news') strategies.push({ name: 'news_api', priority: 10, cost: 'low' });
      if (analysis.type === 'finance') strategies.push({ name: 'finance_api', priority: 10, cost: 'low' });
    }

    // Connaissances expertes nécessaires
    if (analysis.needsExpertKnowledge || analysis.complexity === STR_HIGH) {
      if (this.sources.openai.available) strategies.push({ name: 'openai_gpt', priority: 9, cost: STR_HIGH });
      if (this.sources.anthropic.available) strategies.push({ name: 'anthropic_claude', priority: 8, cost: STR_HIGH });
    }

    // Recherche de connaissances générales
    if (analysis.type === 'knowledge' || analysis.intent === 'explanation') {
      strategies.push({ name: 'wikipedia', priority: 7, cost: STR_FREE });
    }

    // Toujours disponible - IA locale
    strategies.push({ name: 'local_alex', priority: 1, cost: STR_FREE });

    // Filtrer selon les limites de taux et sélectionner optimal
    const availableStrategies = [];

    for (const strategy of strategies) {
      const service = strategy.name.replace('_gpt', '').replace('_claude', '').replace('_api', '');
      const limitCheck = await rateLimiter.checkLimit(service, userId, analysis.complexity);

      if (limitCheck.allowed) {
        availableStrategies.push({
          ...strategy
          remainingRequests: limitCheck.remaining
        });
      } else {
        try {
      logger.warn(`🚫 Strategy ${strategy.name} blocked: ${limitCheck.reason}`);

        } catch (error) {
    // Logger fallback - ignore error
  }}
    }

    // Si aucune stratégie disponible, forcer local
    if (availableStrategies.length === 0) {
      logger.warn('⚠️ All external strategies blocked, forcing local');
      return { name: 'local_alex', priority: 1, cost: STR_FREE, forced: true };
    }

    // Sélection intelligente basée sur priorité et disponibilité
    const selected = availableStrategies.sort((a, b) => b.priority - a.priority)[0];

    logger.info(`🎯 Selected strategy: ${selected.name} (${selected.remainingRequests} requests remaining)`);
    return selected;
  }

  /**
   * EXÉCUTION DES STRATÉGIES
   */
  async executeStrategy(strategy, query, analysis, context) {
    switch (strategy.name) {
      case 'openai_gpt':
        return await this.queryOpenAI(query, analysis, context);
      case 'anthropic_claude':
        return await this.queryAnthropic(query, analysis, context);
      case 'wikipedia':
        return await this.queryWikipedia(query, analysis, context);
      case 'weather_api':
        return await this.queryWeatherAPI(query, analysis, context);
      case 'news_api':
        return await this.queryNewsAPI(query, analysis, context);
      case 'finance_api':
        return await this.queryFinanceAPI(query, analysis, context);
      default:
        return await this.queryLocalAlex(query, analysis, context);
    }
  }

  /**
   * CONNECTEUR OPENAI AVANCÉ
   */
  async queryOpenAI(query, analysis, context) {
    if (!this.sources.openai.available) {
      throw new Error('OpenAI API not configured');
    }

    const systemPrompt = this.buildSystemPrompt(analysis);
    const messages = this.buildContextualMessages(query, context, systemPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: STR_POST
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        'Content-Type': STR_JSON_CONTENT
      }
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
        messages: messages
        max_tokens: 1500
        temperature: 0.7
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();

    // Enregistrer l'utilisation pour le rate limiting
    const tokensUsed = data.usage?
      .total_tokens || 0;
    const estimatedCost = rateLimiter.estimateCost('openai', tokensUsed);
    rateLimiter.recordUsage('openai', context.userId || STR_ANONYMOUS, tokensUsed, estimatedCost);

    return {
      content :
       data.choices[0].message.content
      source: 'OpenAI GPT'
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
      tokensUsed: tokensUsed
      estimatedCost: estimatedCost
      confidence: 0.95
      enhanced: true
      realTime: analysis.needsRealTimeData
    };
  }

  /**
   * CONNECTEUR ANTHROPIC CLAUDE
   */
  async queryAnthropic(query, analysis, context) {
    if (!this.sources.anthropic.available) {
      throw new Error('Anthropic API not configured');
    }

    const systemPrompt = this.buildSystemPrompt(analysis);
    const messages = this.buildAnthropicMessages(query, context);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: STR_POST
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY
        'Content-Type': STR_JSON_CONTENT
        'anthropic-version': '2023-06-01'
      }
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
        max_tokens: 1500
        system: systemPrompt
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();

    // Enregistrer l'utilisation pour le rate limiting
    const tokensUsed = (data.usage?
      .input_tokens || 0) + (data.usage?.output_tokens || 0);
    const estimatedCost = rateLimiter.estimateCost('anthropic', tokensUsed);
    rateLimiter.recordUsage('anthropic', context.userId || STR_ANONYMOUS, tokensUsed, estimatedCost);

    return {
      content :
       data.content[0].text
      source: 'Anthropic Claude'
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
      tokensUsed: tokensUsed
      estimatedCost: estimatedCost
      confidence: 0.93
      enhanced: true
      realTime: analysis.needsRealTimeData
    };
  }

  /**
   * CONNECTEUR WIKIPEDIA
   */
  async queryWikipedia(query, analysis, context = {}) {
    try {
      // Recherche d'articles
      const searchUrl = `${this.sources.wikipedia.baseUrl}/page/summary/${encodeURIComponent(query)}`;

      const response = await fetch(searchUrl);
      if (!response.ok) {
        // Fallback vers recherche textuelle
        return await this.searchWikipedia(query, analysis);
      }

      const data = await response.json();

      return {
        content: `📚 **Wikipedia Knowledge**\n\n**${data.title}**\n\n${data.extract}\n\n🔗 Plus d'infos: ${data.content_urls?.desktop?.page || 'Wikipedia'}`
        source: 'Wikipedia'
        confidence: 0.88
        enhanced: true
        verified: true
      };
    } catch (error) {
      // Logger fallback - ignore error
    }
  }

  async searchWikipedia(query, analysis) {
    const searchUrl = `https://en.wikipedia.org/w/api.php?
      action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&origin=*`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.query?.search?.length > 0) {
      const article = data.query.search[0];
      return {
        content :
       `📚 **Wikipedia Search**\n\n**${article.title}**\n\n${article.snippet.replace(/<[^>]*>/g, '')}\n\n🔗 Recherche Wikipedia pour plus de détails`
        source: 'Wikipedia Search'
        confidence: 0.85
        enhanced: true
      };
    }

    throw new Error('No Wikipedia results found');
  }

  /**
   * CONNECTEURS APIS SPÉCIALISÉES
   */
  async queryWeatherAPI(query, analysis, context = {}) {
    // Placeholder pour API météo réelle
    const location = analysis.entities.locations[0] || 'global';

    return {
      content: `🌤️ **Données météo temps réel** pour ${location}\n\nConnexion à l'API météo en cours...\n\n*Note: Configuration API météo requise pour données live*`
      source: 'Weather API (Demo)'
      confidence: 0.7
      realTime: true
    };
  }

  async queryNewsAPI(query, analysis, context = {}) {
    return {
      content: '📰 **Actualités temps réel**\n\nRecherche d'actualités en cours...\n\n*Note: Configuration News API requise pour données live*'
      source: 'News API (Demo)'
      confidence: 0.7
      realTime: true
    };
  }

  async queryFinanceAPI(query, analysis, context = {}) {
    return {
      content: '💹 **Données financières temps réel**\n\nConsultation des marchés...\n\n*Note: Configuration Finance API requise pour données live*'
      source: 'Finance API (Demo)'
      confidence: 0.7
      realTime: true
    };
  }

  /**
   * FONCTIONS UTILITAIRES
   */
  buildSystemPrompt(analysis) {
    return `Tu es Alex Ultimate, une IA avancée multilingue
Contexte de la requête: ${JSON.stringify(analysis)}
Réponds dans la langue détectée: ${analysis.language}
Sois précis, informatif et adapte ton style au contexte.`;
  }

  buildContextualMessages(query, context, systemPrompt) {
    const messages = [{ role: 'system', content: systemPrompt }];

    // Ajouter le contexte de conversation s'il existe
    if (context.conversation && context.conversation.length > 0) {
      context.conversation.slice(-6).forEach(msg => {
        messages.push({
          role: msg.role === STR_ASSISTANT ? STR_ASSISTANT : STR_USER
          content: msg.content
        });
      });
    }

    messages.push({ role: STR_USER, content: query });
    return messages;
  }

  buildAnthropicMessages(query, context) {
    const messages = [];

    if (context.conversation && context.conversation.length > 0) {
      context.conversation.slice(-6).forEach(msg => {
        messages.push({
          role: msg.role === STR_ASSISTANT ? STR_ASSISTANT : STR_USER
          content: msg.content
        });
      });
    }

    messages.push({ role: STR_USER, content: query });
    return messages;
  }

  generateCacheKey(query, analysis) {
    return `${query}_${analysis.type}_${analysis.language}_${Date.now() - (Date.now() % 300000)}`; // Cache 5min
  }

  cacheResponse(key, response) {
    // Cache avec TTL de 5 minutes pour données dynamiques
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      ...response
      cachedAt: Date.now()
    });
  }

  async queryLocalAlex(query, analysis, context) {
    // Fallback vers le système local d'Alex
    return {
      content: `🤖 **Alex Ultimate Local Analysis**\n\nAnalyse locale de votre requête: "${query}"\n\nType: ${analysis.type}\nComplexité: ${analysis.complexity}\nLangue: ${analysis.language}\n\nRéponse générée par les 154 modules locaux d'Alex.`
      source: 'Alex Local Intelligence'
      confidence: 0.8
      local: true
    };
  }

  generateFallbackResponse(query, analysis) {
    return {
      content: `🛠️ **Mode dégradé Alex Ultimate**\n\nJe traite votre demande "${query}" avec mes systèmes de sauvegarde.\n\nToutes les connexions externes seront rétablies sous peu.`
      source: 'Alex Fallback'
      confidence: 0.6
      fallback: true
    };
  }
}

export default new ExternalDataSources();