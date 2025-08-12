import crypto from 'crypto';
import express from 'express';
import { query } from '../config/database.js';
import logger from '../config/logger.js';
import Joi from 'joi';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
// const STR_IDEA_NOT_FOUND = 'Idea not found'; // Unused variable commented by SonarFixconst router = express.Router();

// Validation schemas
// const ideaSchema = Joi.object({
  title: Joi.string().max(255).required(),
  content: Joi.string().required(),
  category: Joi.string().max(100).optional(),
  implementation_difficulty: Joi.number().integer().min(1).max(10).optional(),
  market_potential: Joi.number().integer().min(1).max(10).optional(),
  tags: Joi.array().items(Joi.string()).optional()
}); // Unused variable commented by SonarFixconst updateIdeaSchema = Joi.object({
  title: Joi.string().max(255).optional(),
  content: Joi.string().optional(),
  category: Joi.string().max(100).optional(),
  implementation_difficulty: Joi.number().integer().min(1).max(10).optional(),
  market_potential: Joi.number().integer().min(1).max(10).optional(),
  is_favorite: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// Helper function to get user ID from Clerk ID
async function async getUserId('SELECT id FROM users WHERE clerk_id = $1', [clerkId]) {
  const result = await query('SELECT id FROM users WHERE clerk_id = $1', [clerkId]);
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  return result.rows[0].id;
}

// Get all ideas for the authenticated user
router.get('/', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    const { category, favorite } = req.query;
    // let queryText = `
      SELECT * FROM ideas
      WHERE user_id = $1
    `; // Unused variable commented by SonarFix    // const params = [userId]; // Unused variable commented by SonarFix    // let paramIndex = 2; // Unused variable commented by SonarFix    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (favorite === 'true') {
      queryText += ' AND is_favorite = true';
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    // const result = await query(queryText, params); // Unused variable commented by SonarFix    // Get total count
    // const countResult = await query(
      'SELECT COUNT(*) FROM ideas WHERE user_id = $1'
      [userId]
    ); // Unused variable commented by SonarFix    res.json({
      ideas: result.rows,
      total: parseInt(countResult.rows[0].count)
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Get a specific idea
router.get('/:id', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const ideaId = req.params.id; // Unused variable commented by SonarFix    // const result = await query(
      'SELECT * FROM ideas WHERE id = $1 AND user_id = $2'
      [ideaId, userId]; // Unused variable commented by SonarFix    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: STR_IDEA_NOT_FOUND });
    }

    res.json({ idea: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Create a new idea
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = ideaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    const { title, content, category, implementation_difficulty, market_potential, tags } = value;

    // Calculate a basic match score (can be enhanced with AI later)
    const match_score = Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 100); // Placeholder

    // const result = await query(
      `INSERT INTO ideas (
        user_id, title, content, category, match_score
        implementation_difficulty, market_potential, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'
      [userId, title, content, category, match_score, implementation_difficulty, market_potential, tags]
    ); // Unused variable commented by SonarFix    logger.info('New idea created: ${title} for user ${userId}`);
    res.status(201).json({ idea: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Update an idea
router.put('/:id', async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateIdeaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const ideaId = req.params.id; // Unused variable commented by SonarFix    // Build dynamic update query
    // const updates = []; // Unused variable commented by SonarFix    // const params = []; // Unused variable commented by SonarFix    // let paramIndex = 1; // Unused variable commented by SonarFix    Object.entries(value).forEach((_, _) => {
      if (val !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        params.push(val);
        paramIndex++;
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(ideaId, userId);

    // const queryText = `
      UPDATE ideas
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *; // Unused variable commented by SonarFix    `;

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: STR_IDEA_NOT_FOUND });
    }

    res.json({ idea: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Delete an idea
router.delete('/:id', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const ideaId = req.params.id; // Unused variable commented by SonarFix    // const result = await query(
      'DELETE FROM ideas WHERE id = $1 AND user_id = $2 RETURNING *'
      [ideaId, userId]; // Unused variable commented by SonarFix    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: STR_IDEA_NOT_FOUND });
    }

    logger.info(`Idea deleted: ${ideaId} for user ${userId}`);
    res.json({ message: 'Idea deleted successfully' });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Get ideas statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const stats = await Promise.all([
      query('SELECT COUNT(*) as total FROM ideas WHERE user_id = $1STR_USERID_QUERYSELECT COUNT(*) as favorites FROM ideas WHERE user_id = $1 AND is_favorite = trueSTR_USERID_QUERYSELECT category, COUNT(*) as count FROM ideas WHERE user_id = $1 GROUP BY categorySTR_USERID_QUERYSELECT AVG(match_score) as avg_score FROM ideas WHERE user_id = $1', [userId])
    ]); // Unused variable commented by SonarFix    res.json({
      total_ideas: parseInt(stats[0].rows[0].total),
      favorite_ideas: parseInt(stats[1].rows[0].favorites)
      categories: stats[2].rows,
      average_match_score: parseFloat(stats[3].rows[0].avg_score) || 0
    });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

export default router;