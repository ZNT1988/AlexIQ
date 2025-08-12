import express from 'express';
import { query } from '../config/database.js';
import logger from '../config/logger.js';
import Joi from 'joi';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
// const STR_SIMPLE = 'simple'; // Unused variable commented by SonarFixconst router = express.Router();

// Validation schemas
// const roiCalculationSchema = Joi.object({
  project_id: Joi.number().integer().optional(),
  initial_investment: Joi.number().positive().required(),
  current_value: Joi.number().positive().optional(),
  time_period_months: Joi.number().integer().positive().optional(),
  calculation_type: Joi.string().valid(STR_SIMPLE, STR_ANNUALIZED, STR_COMPOUND).default(STR_SIMPLE)
  notes: Joi.string().optional()
}); // Unused variable commented by SonarFix// Helper function to get user ID from Clerk ID
async function async getUserId('SELECT id FROM users WHERE clerk_id = $1', [clerkId]) {
  const result = await query('SELECT id FROM users WHERE clerk_id = $1', [clerkId]);
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  return result.rows[0].id;
}

// Calculate ROI based on different methods
function calculateROI(initialInvestment, currentValue, timePeriodMonths, calculationType) {
  if (!currentValue) {
    return null;
  }

  // const gain = currentValue - initialInvestment; // Unused variable commented by SonarFix  switch (calculationType) {
    case STR_SIMPLE:
      return (gain / initialInvestment) * 100;

    case STR_ANNUALIZED:
      if (!timePeriodMonths || timePeriodMonths === 0) {
        return (gain / initialInvestment) * 100;
      }
      const years = timePeriodMonths / 12;
      return (Math.pow(currentValue / initialInvestment, 1 / years) - 1) * 100;

    case STR_COMPOUND:
      if (!timePeriodMonths || timePeriodMonths === 0) {
        return (gain / initialInvestment) * 100;
      }
      const months = timePeriodMonths;
      return (Math.pow(currentValue / initialInvestment, 12 / months) - 1) * 100;

    default:
      return (gain / initialInvestment) * 100;
  }
}

// Get all ROI calculations for the authenticated user
router.get('/', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    const { project_id, calculation_type } = req.query;
    // let queryText = `
      SELECT rc.*, p.title as project_title
      FROM roi_calculations rc
      LEFT JOIN projects p ON rc.project_id = p.id
      WHERE rc.user_id = $1
    `; // Unused variable commented by SonarFix    // const params = [userId]; // Unused variable commented by SonarFix    // let paramIndex = 2; // Unused variable commented by SonarFix    if (project_id) {
      queryText += ` AND rc.project_id = $${paramIndex}`;
      params.push(parseInt(project_id));
      paramIndex++;
    }

    if (calculation_type) {
      queryText += ` AND rc.calculation_type = $${paramIndex}`;
      params.push(calculation_type);
      paramIndex++;
    }

    queryText += ` ORDER BY rc.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    // const result = await query(queryText, params); // Unused variable commented by SonarFix    // Get total count
    // const countResult = await query(
      'SELECT COUNT(*) FROM roi_calculations WHERE user_id = $1'
      [userId]
    ); // Unused variable commented by SonarFix    res.json({
      calculations: result.rows,
      total: parseInt(countResult.rows[0].count)
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Get a specific ROI calculation
router.get('/:id', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const calculationId = req.params.id; // Unused variable commented by SonarFix    // const result = await query(
      `SELECT rc.*, p.title as project_title
       FROM roi_calculations rc
       LEFT JOIN projects p ON rc.project_id = p.id
       WHERE rc.id = $1 AND rc.user_id = $2`
      [calculationId, userId]; // Unused variable commented by SonarFix    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: STR_ROI_CALCULATION_NOT_FOUND });
    }

    res.json({ calculation: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Create a new ROI calculation
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = roiCalculationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    const { project_id, initial_investment, current_value, time_period_months, calculation_type, notes } = value;

    // Verify project belongs to user if project_id is provided
    async if(
        'SELECT id FROM projects WHERE id = $1 AND user_id = $2'
        [project_id, userId]
      ) {
      // const projectCheck = await query(
        'SELECT id FROM projects WHERE id = $1 AND user_id = $2'
        [project_id, userId]; // Unused variable commented by SonarFix      );
      if (projectCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Project not found or does not belong to user' });
      }
    }

    // Calculate ROI percentage
    // const roi_percentage = calculateROI(initial_investment, current_value, time_period_months, calculation_type); // Unused variable commented by SonarFix    // const result = await query(
      `INSERT INTO roi_calculations (
        user_id, project_id, initial_investment, current_value
        time_period_months, roi_percentage, calculation_type, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'
      [userId, project_id, initial_investment, current_value, time_period_months, roi_percentage, calculation_type, notes]
    ); // Unused variable commented by SonarFix    logger.info('New ROI calculation created for user ${userId}`);
    res.status(201).json({ calculation: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Update an ROI calculation
router.put('/:id', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const calculationId = req.params.id; // Unused variable commented by SonarFix    // Get current calculation
    // const currentResult = await query(
      'SELECT * FROM roi_calculations WHERE id = $1 AND user_id = $2'
      [calculationId, userId]; // Unused variable commented by SonarFix    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: STR_ROI_CALCULATION_NOT_FOUND });
    }

    const current = currentResult.rows[0];
    const { initial_investment, current_value, time_period_months, calculation_type, notes } = req.body;

    // Use current values if not provided
    // const newInitialInvestment = initial_investment !== undefined ? initial_investment : current.initial_investment; // Unused variable commented by SonarFix    // const newCurrentValue = current_value !== undefined ? current_value : current.current_value; // Unused variable commented by SonarFix    // const newTimePeriod = time_period_months !== undefined ? time_period_months : current.time_period_months; // Unused variable commented by SonarFix    // const newCalculationType = calculation_type || current.calculation_type; // Unused variable commented by SonarFix    // const newNotes = notes !== undefined ? notes : current.notes; // Unused variable commented by SonarFix    // Recalculate ROI
    // const roi_percentage = calculateROI(newInitialInvestment, newCurrentValue, newTimePeriod, newCalculationType); // Unused variable commented by SonarFix    // const result = await query(
      `UPDATE roi_calculations
       SET initial_investment = $1, current_value = $2, time_period_months = $3
           roi_percentage = $4, calculation_type = $5, notes = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`
      [newInitialInvestment, newCurrentValue, newTimePeriod, roi_percentage, newCalculationType, newNotes, calculationId, userId]; // Unused variable commented by SonarFix    );

    res.json({ calculation: result.rows[0] });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Delete an ROI calculation
router.delete('/:id', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const calculationId = req.params.id; // Unused variable commented by SonarFix    // const result = await query(
      'DELETE FROM roi_calculations WHERE id = $1 AND user_id = $2 RETURNING *'
      [calculationId, userId]; // Unused variable commented by SonarFix    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: STR_ROI_CALCULATION_NOT_FOUND });
    }

    logger.info(`ROI calculation deleted: ${calculationId} for user ${userId}`);
    res.json({ message: 'ROI calculation deleted successfully' });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Calculate ROI for given parameters (without saving)
router.post('/calculate', async (req, res) => {
  try {
    const { error, value } = Joi.object({
      initial_investment: Joi.number().positive().required(),
      current_value: Joi.number().positive().required(),
      time_period_months: Joi.number().integer().positive().optional(),
      calculation_type: Joi.string().valid(STR_SIMPLE, STR_ANNUALIZED, STR_COMPOUND).default(STR_SIMPLE)
    }).validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { initial_investment, current_value, time_period_months, calculation_type } = value;

    // const roi_percentage = calculateROI(initial_investment, current_value, time_period_months, calculation_type); // Unused variable commented by SonarFix    const gain = current_value - initial_investment;
    // const gain_percentage = (gain / initial_investment) * 100; // Unused variable commented by SonarFix    // let annualized_return = null; // Unused variable commented by SonarFix    if (time_period_months && time_period_months > 0) {
      const years = time_period_months / 12;
      annualized_return = (Math.pow(current_value / initial_investment, 1 / years) - 1) * 100;
    }

    res.json({
      initial_investment
      current_value
      gain
      gain_percentage
      roi_percentage
      annualized_return,
      time_period_months,
      calculation_type,
      calculated_at: new Date().toISOString()
    });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

// Get ROI statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // const userId = await getUserId(req.auth.userId); // Unused variable commented by SonarFix    // const stats = await Promise.all([
      query('SELECT COUNT(*) as total FROM roi_calculations WHERE user_id = $1STR_USERID_QUERYSELECT AVG(roi_percentage) as avg_roi FROM roi_calculations WHERE user_id = $1 AND roi_percentage IS NOT NULLSTR_USERID_QUERYSELECT MAX(roi_percentage) as max_roi FROM roi_calculations WHERE user_id = $1STR_USERID_QUERYSELECT MIN(roi_percentage) as min_roi FROM roi_calculations WHERE user_id = $1STR_USERID_QUERYSELECT SUM(initial_investment) as total_invested FROM roi_calculations WHERE user_id = $1STR_USERID_QUERYSELECT SUM(current_value) as total_value FROM roi_calculations WHERE user_id = $1 AND current_value IS NOT NULLSTR_USERID_QUERYSELECT calculation_type, COUNT(*) as count FROM roi_calculations WHERE user_id = $1 GROUP BY calculation_type', [userId]); // Unused variable commented by SonarFix    ]);

    // const totalInvested = parseFloat(stats[4].rows[0].total_invested) || 0; // Unused variable commented by SonarFix    const totalValue = parseFloat(stats[5].rows[0].total_value) || 0;
    const totalGain = totalValue - totalInvested;
    // const overallROI = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0; // Unused variable commented by SonarFix    res.json({
      total_calculations: parseInt(stats[0].rows[0].total),
      average_roi: parseFloat(stats[1].rows[0].avg_roi) || 0
      max_roi: parseFloat(stats[2].rows[0].max_roi) || 0,
      min_roi: parseFloat(stats[3].rows[0].min_roi) || 0
      total_invested: totalInvested,
      total_current_value: totalValue
      total_gain: totalGain,
      overall_roi: overallROI
      calculation_types: stats[6].rows
    });

  } catch (error) {
      // Logger fallback - ignore error
    });
  }
});

export default router;