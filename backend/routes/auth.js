import express from 'express';
import { requireAuth } from '@clerk/express';
import { query } from '../config/database.js';
import logger from '../config/logger.js';
import Joi from 'joi';

const router = express.Router();

// Constants
const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  FETCH_PROFILE_FAILED: 'Failed to fetch user profile',
  UPDATE_PROFILE_FAILED: 'Failed to update user profile',
  FETCH_PREFERENCES_FAILED: 'Failed to fetch preferences',
  UPDATE_PREFERENCES_FAILED: 'Failed to update preferences',
  DELETE_ACCOUNT_FAILED: 'Failed to delete account',
  VALIDATION_ERROR: 'Invalid input data'
};

// Validation schemas
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required()
});

const updatePreferencesSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'cosmic').optional(),
  language: Joi.string().min(2).max(5).optional(),
  timezone: Joi.string().max(50).optional(),
  notifications_enabled: Joi.boolean().optional(),
  ai_assistance_level: Joi.number().min(0).max(1).optional()
});

// Get current user profile
router.get('/profile', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    const userResult = await query(
      'SELECT * FROM users WHERE clerk_id = ?',
      [userId]
    );
    
    if (userResult.length === 0) {
      return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    
    res.json(userResult[0]);
  } catch (error) {
    logger.error('Failed to fetch user profile:', error);
    res.status(500).json({ error: ERROR_MESSAGES.FETCH_PROFILE_FAILED });
  }
});

// Update user profile
router.put('/profile', requireAuth(), async (req, res) => {
  try {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: ERROR_MESSAGES.VALIDATION_ERROR, details: error.details });
    }
    
    const userId = req.auth.userId;
    const { firstName, lastName } = req.body;
    
    await query(
      'UPDATE users SET first_name = ?, last_name = ?, updated_at = NOW() WHERE clerk_id = ?',
      [firstName, lastName, userId]
    );
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Failed to update user profile:', error);
    res.status(500).json({ error: ERROR_MESSAGES.UPDATE_PROFILE_FAILED });
  }
});

// Get user preferences
router.get('/preferences', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    const preferencesResult = await query(
      'SELECT * FROM user_preferences WHERE user_id = (SELECT id FROM users WHERE clerk_id = ?)',
      [userId]
    );
    
    if (preferencesResult.length === 0) {
      // Return default preferences
      return res.json({
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications_enabled: true,
        ai_assistance_level: 0.8
      });
    }
    
    res.json(preferencesResult[0]);
  } catch (error) {
    logger.error('Failed to fetch user preferences:', error);
    res.status(500).json({ error: ERROR_MESSAGES.FETCH_PREFERENCES_FAILED });
  }
});

// Update user preferences
router.put('/preferences', requireAuth(), async (req, res) => {
  try {
    const { error } = updatePreferencesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: ERROR_MESSAGES.VALIDATION_ERROR, details: error.details });
    }
    
    const userId = req.auth.userId;
    const preferences = req.body;
    
    // Get user ID
    const userResult = await query('SELECT id FROM users WHERE clerk_id = ?', [userId]);
    if (userResult.length === 0) {
      return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    
    const userDbId = userResult[0].id;
    
    // Upsert preferences
    const fields = Object.keys(preferences).join(', ');
    const values = Object.values(preferences);
    const placeholders = values.map(() => '?').join(', ');
    
    await query(
      `INSERT INTO user_preferences (user_id, ${fields}) VALUES (?, ${placeholders})
       ON DUPLICATE KEY UPDATE ${Object.keys(preferences).map(key => `${key} = ?`).join(', ')}`,
      [userDbId, ...values, ...values]
    );
    
    res.json({ success: true, message: 'Preferences updated successfully' });
  } catch (error) {
    logger.error('Failed to update user preferences:', error);
    res.status(500).json({ error: ERROR_MESSAGES.UPDATE_PREFERENCES_FAILED });
  }
});

// Delete user account
router.delete('/account', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    // Soft delete - mark as deleted instead of actual deletion
    await query(
      'UPDATE users SET deleted_at = NOW() WHERE clerk_id = ?',
      [userId]
    );
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete user account:', error);
    res.status(500).json({ error: ERROR_MESSAGES.DELETE_ACCOUNT_FAILED });
  }
});

export default router;