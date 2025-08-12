import express from 'express';
import { query } from '../config/database.js';
import logger from '../config/logger.js';
import Joi from 'joi';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
// const STR_ACTIVE = 'active'; // Unused variable commented by SonarFixconst router = express.Router();

// Validation schemas
// const projectSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().optional(),
  status: Joi.string().valid(STR_ACTIVE, 'paused', STR_COMPLETED, 'archived').default(STR_ACTIVE)
  priority: Joi.number().integer().min(1).max(5).default(1),
  deadline: Joi.date().optional(),
  budget: Joi.number().positive().optional(),
  roi_estimated: Joi.number().optional(),
  tags: Joi.array().items(Joi.string()).optional()
}); // Unused variable commented by SonarFixconst updateProjectSchema = Joi.object({
  title: Joi.string().max(255).optional(),
  description: Joi.string().optional(),
  status: Joi.string().valid(STR_ACTIVE, 'paused', STR_COMPLETED, 'archived').optional()
  priority: Joi.number().integer().min(1).max(5).optional(),
  deadline: Joi.date().optional().allow(null),
  budget: Joi.number().positive().optional().allow(null),
  roi_estimated: Joi.number().optional().allow(null),
  roi_actual: Joi.number().optional().allow(null),
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

// Get all projects for the authenticated user
router.get('/', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    const { status, priority } = req.query;
    // let queryText = `
      SELECT *
        CASE
          WHEN deadline < CURRENT_DATE AND status != STR_COMPLETED THEN true
          ELSE false
        END as is_overdue
      FROM projects
      WHERE user_id = $1
    `; // Unused variable commented by SonarFix    // const params = [userId]; // Unused variable commented by SonarFix    // let paramIndex = 2; // Unused variable commented by SonarFix    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      queryText += ` AND priority = $${paramIndex}`;
      params.push(parseInt(priority));
      paramIndex++;
    }

    queryText += ` ORDER BY priority DESC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    // const result = await query(queryText, params); // Unused variable commented by SonarFix    // Get total count
    // const countResult = await query(
      'SELECT COUNT(*) FROM projects WHERE user_id = $1'
      [userId]
    ); // Unused variable commented by SonarFix    res.json({
      projects: result.rows,
      total: parseInt(countResult.rows[0].count)
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Get a specific project
router.get('/:id', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const projectId = req.params.id; // Unused variable commented by SonarFix    // const result = await query(
      `SELECT *
        CASE
          WHEN deadline < CURRENT_DATE AND status != STR_COMPLETED THEN true
          ELSE false
        END as is_overdue
       FROM projects
       WHERE id = $1 AND user_id = $2`
      [projectId, userId]; // Unused variable commented by SonarFix    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: STR_PROJECT_NOT_FOUND });
    }

    // Get related ROI calculations
    // const roiResult = await query(
      'SELECT * FROM roi_calculations WHERE project_id = $1 ORDER BY created_at DESC'
      [projectId]
    ); // Unused variable commented by SonarFix    const project = result.rows[0];
    project.roi_calculations = roiResult.rows;

    res.json({ project });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    const { title, description, status, priority, deadline, budget, roi_estimated, tags } = value;

    // const result = await query(
      `INSERT INTO projects (
        user_id, title, description, status, priority, deadline, budget, roi_estimated, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *'
      [userId, title, description, status, priority, deadline, budget, roi_estimated, tags]
    ); // Unused variable commented by SonarFix    logger.info('New project created: ${title} for user ${userId}`);
    res.status(201).json({ project: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const projectId = req.params.id; // Unused variable commented by SonarFix    // Build dynamic update query
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
    params.push(projectId, userId);

    // const queryText = `
      UPDATE projects
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *; // Unused variable commented by SonarFix    `;

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: STR_PROJECT_NOT_FOUND });
    }

    res.json({ project: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const projectId = req.params.id; // Unused variable commented by SonarFix    // const result = await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *'
      [projectId, userId]; // Unused variable commented by SonarFix    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: STR_PROJECT_NOT_FOUND });
    }

    logger.info(`Project deleted: ${projectId} for user ${userId}`);
    res.json({ message: 'Project deleted successfully' });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Get projects statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const stats = await Promise.all([
      query('SELECT COUNT(*) as total FROM projects WHERE user_id = $1STR_USERID_QUERYSELECT COUNT(*) as active FROM projects WHERE user_id = $1 AND status = $2', [userId, STR_ACTIVE])
      query('SELECT COUNT(*) as completed FROM projects WHERE user_id = $1 AND status = $2', [userId, STR_COMPLETED])
      query('SELECT COUNT(*) as overdue FROM projects WHERE user_id = $1 AND deadline < CURRENT_DATE AND status != $2', [userId, STR_COMPLETED])
      query('SELECT status, COUNT(*) as count FROM projects WHERE user_id = $1 GROUP BY statusSTR_USERID_QUERYSELECT AVG(roi_actual) as avg_roi FROM projects WHERE user_id = $1 AND roi_actual IS NOT NULLSTR_USERID_QUERYSELECT SUM(budget) as total_budget FROM projects WHERE user_id = $1 AND budget IS NOT NULL', [userId])
    ]); // Unused variable commented by SonarFix    res.json({
      total_projects: parseInt(stats[0].rows[0].total),
      active_projects: parseInt(stats[1].rows[0].active)
      completed_projects: parseInt(stats[2].rows[0].completed),
      overdue_projects: parseInt(stats[3].rows[0].overdue)
      status_breakdown: stats[4].rows,
      average_roi: parseFloat(stats[5].rows[0].avg_roi) || 0
      total_budget: parseFloat(stats[6].rows[0].total_budget) || 0
    });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Get projects by priority
router.get('/priority/:level', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    const priority = parseInt(req.params.level);

    if (priority < 1 || priority > 5) {
      return res.status(400).json({ error: 'Priority must be between 1 and 5' });
    }

    // const result = await query(
      'SELECT * FROM projects WHERE user_id = $1 AND priority = $2 ORDER BY created_at DESC'
      [userId, priority]; // Unused variable commented by SonarFix    );

    res.json({ projects: result.rows });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

export default router;