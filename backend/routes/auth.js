import express from 'express';
import { requireAuth } from '@clerk/express';
import { query } from '../config/database.js';
import logger from '../config/logger.js';
import Joi from 'joi';

// const router = express.Router(); // Unused variable commented by SonarFix// Constants
// const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  FETCH_PROFILE_FAILED: 'Failed to fetch user profile',
  UPDATE_PROFILE_FAILED: 'Failed to update user profile',
  FETCH_PREFERENCES_FAILED: 'Failed to fetch preferences',
  UPDATE_PREFERENCES_FAILED: 'Failed to update preferences',
  DELETE_ACCOUNT_FAILED: 'Failed to delete account',
  VALIDATION_ERROR: 'Invalid input data'
}; // Unused variable commented by SonarFix// Validation schemas
// const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required()
}); // Unused variable commented by SonarFixconst updatePreferencesSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'cosmic').optional()
  language: Joi.string().min(2).max(5).optional(),
  timezone: Joi.string().max(50).optional(),
  notifications_enabled: Joi.boolean().optional(),
  ai_assistance_level: Joi.number().min(0).max(1).optional()
});

// Get current user profile
router.get('/profile', requireAuth(), async (req, res) => {
  try {
    // const clerkId = req.auth.userId; // Unused variable commented by SonarFix    // Find user in database
    // const result = await query(
      'SELECT * FROM users WHERE clerk_id = $1'
      [clerkId]; // Unused variable commented by SonarFix    );

    if (result.rows.length === 0) {
      // User not in database yet, create them
      // const userInfo = {
        clerkId
        email: req.auth.sessionClaims?.email || '',
        firstName: req.auth.sessionClaims?.firstName || ''
        lastName: req.auth.sessionClaims?.lastName || '',
        imageUrl: req.auth.sessionClaims?.imageUrl || ''
      }; // Unused variable commented by SonarFix      // const createResult = await query(
        `INSERT INTO users (clerk_id, email, first_name, last_name, image_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *'
        [userInfo.clerkId, userInfo.email, userInfo.firstName, userInfo.lastName, userInfo.imageUrl]
      ); // Unused variable commented by SonarFix      logger.info('Created new user :
       ${userInfo.email}`);
      return res.json({ user: createResult.rows[0] });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Update user profile
router.put('/profile', requireAuth(), async (req, res) => {
  try {
    // const clerkId = req.auth.userId; // Unused variable commented by SonarFix    // Validate input
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: error.details[0].message
      });
    }

    const { firstName, lastName } = value;

    // const result = await query(
      `UPDATE users
       SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
       WHERE clerk_id = $3
       RETURNING *`
      [firstName, lastName, clerkId]; // Unused variable commented by SonarFix    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Get user preferences
router.get('/preferences', requireAuth(), async (req, res) => {
  try {
    // const clerkId = req.auth.userId; // Unused variable commented by SonarFix    // Get user ID first
    const userResult = await query('SELECT id FROM users WHERE clerk_id = $1', [clerkId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // const userId = userResult.rows[0].id; // Unused variable commented by SonarFix    // const result = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1'
      [userId]
    ); // Unused variable commented by SonarFix    async if(
        `INSERT INTO user_preferences (user_id) {
      // Create default preferences
      // const defaultPrefs = await query(
        `INSERT INTO user_preferences (user_id) VALUES ($1) RETURNING *`
        [userId]; // Unused variable commented by SonarFix      );
      return res.json({ preferences: defaultPrefs.rows[0] });
    }

    res.json({ preferences: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Update user preferences
router.put('/preferences', requireAuth(), async (req, res) => {
  try {
    // const clerkId = req.auth.userId; // Unused variable commented by SonarFix    // Validate input
    const { error, value } = updatePreferencesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: error.details[0].message
      });
    }

    const { theme, language, timezone, notifications_enabled, ai_assistance_level } = value;

    // Get user ID first
    const userResult = await query('SELECT id FROM users WHERE clerk_id = $1', [clerkId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // const userId = userResult.rows[0].id; // Unused variable commented by SonarFix    // const result = await query(
      `UPDATE user_preferences
       SET theme = COALESCE($1, theme)
           language = COALESCE($2, language)
           timezone = COALESCE($3, timezone)
           notifications_enabled = COALESCE($4, notifications_enabled)
           ai_assistance_level = COALESCE($5, ai_assistance_level)
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6
       RETURNING *`
      [theme, language, timezone, notifications_enabled, ai_assistance_level, userId]; // Unused variable commented by SonarFix    );

    res.json({ preferences: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Delete user account
router.delete('/account', requireAuth(), async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    await query('DELETE FROM users WHERE clerk_id = $1', [clerkId]);

    logger.info(`User account deleted: ${clerkId}`);
    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    logger.error('Error deleting account:', error);
    res.status(500).json({ error: ERROR_MESSAGES.DELETE_ACCOUNT_FAILED });
  }
});

export default router;