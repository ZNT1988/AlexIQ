import express from 'express';
import googleService from '../services/google.js';

const router = express.Router();

/**
 * @route POST /api/google/chat
 * @desc Chat avec Google Gemini/Vertex AI
 * @access Public
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'missing_message',
        message: 'Message is required'
      });
    }

    const result = await googleService.chat(message, context || []);
    
    if (result.success) {
      res.json({
        output: result.content,
        provider: result.provider,
        model: result.model,
        success: true,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        error: 'google_ai_error',
        message: result.error,
        provider: result.provider
      });
    }

  } catch (error) {
    console.error('❌ Google Chat Error:', error);
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * @route POST /api/google/maps/search
 * @desc Recherche de lieux avec Google Maps
 * @access Public
 */
router.post('/maps/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'missing_query',
        message: 'Search query is required'
      });
    }

    const result = await googleService.getLocationInfo(query);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        provider: result.provider
      });
    } else {
      res.status(500).json({
        error: 'maps_error',
        message: result.error,
        provider: result.provider
      });
    }

  } catch (error) {
    console.error('❌ Google Maps Search Error:', error);
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * @route POST /api/google/maps/geocode
 * @desc Géocodage d'adresse avec Google Maps
 * @access Public
 */
router.post('/maps/geocode', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        error: 'missing_address',
        message: 'Address is required'
      });
    }

    const result = await googleService.geocode(address);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        provider: result.provider
      });
    } else {
      res.status(500).json({
        error: 'geocoding_error',
        message: result.error,
        provider: result.provider
      });
    }

  } catch (error) {
    console.error('❌ Geocoding Error:', error);
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/google/status
 * @desc Statut des services Google
 * @access Public
 */
router.get('/status', async (req, res) => {
  try {
    const status = googleService.getStatus();
    
    res.json({
      success: true,
      services: status,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ Google Status Error:', error);
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

export default router;