/**
 * @fileoverview Ideas Routes - API endpoints pour la gestion des idées
 */

import express from "express";
import { query } from "../config/database.js";
import logger from "../config/logger.js";
import Joi from "joi";

const STR_IDEA_NOT_FOUND = "Idea not found";
const router = express.Router();

// Validation schemas
const ideaSchema = Joi.object({
  title: Joi.string().max(255).required(),
  content: Joi.string().required(),
  category: Joi.string().max(100).optional(),
  implementation_difficulty: Joi.number().integer().min(1).max(10).optional(),
  market_potential: Joi.number().integer().min(1).max(10).optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

const updateIdeaSchema = Joi.object({
  title: Joi.string().max(255).optional(),
  content: Joi.string().optional(),
  category: Joi.string().max(100).optional(),
  implementation_difficulty: Joi.number().integer().min(1).max(10).optional(),
  market_potential: Joi.number().integer().min(1).max(10).optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// Helper function to get user ID from Clerk ID
async function getUserId(clerkId) {
  try {
    const result = await query("SELECT id FROM users WHERE clerk_id = $1", [clerkId]);
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }
    return result.rows[0].id;
  } catch (error) {
    logger.warn("Failed to get user ID:", error.message);
    return null;
  }
}

// Get all ideas for the authenticated user
router.get("/", async (req, res) => {
  try {
    const userId = await getUserId(req.auth?.userId);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { category, favorite, limit = 50, offset = 0 } = req.query;
    
    let queryText = "SELECT * FROM ideas WHERE user_id = $1";
    const params = [userId];
    let paramIndex = 2;

    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (favorite === "true") {
      queryText += " AND is_favorite = true";
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);
    
    // Get total count
    const countResult = await query(
      "SELECT COUNT(*) FROM ideas WHERE user_id = $1",
      [userId]
    );

    res.json({
      ideas: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error("Error fetching ideas:", error);
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
});

// Get a specific idea
router.get("/:id", async (req, res) => {
  try {
    const userId = await getUserId(req.auth?.userId);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { id } = req.params;
    const result = await query(
      "SELECT * FROM ideas WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: STR_IDEA_NOT_FOUND });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Error fetching idea:", error);
    res.status(500).json({ error: "Failed to fetch idea" });
  }
});

// Create a new idea
router.post("/", async (req, res) => {
  try {
    const { error, value } = ideaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = await getUserId(req.auth?.userId);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const {
      title,
      content,
      category,
      implementation_difficulty,
      market_potential,
      tags
    } = value;

    const result = await query(
      `INSERT INTO ideas (
        user_id, title, content, category, 
        implementation_difficulty, market_potential, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        userId,
        title,
        content,
        category,
        implementation_difficulty,
        market_potential,
        JSON.stringify(tags || [])
      ]
    );

    logger.info(`New idea created: ${title} by user ${userId}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error("Error creating idea:", error);
    res.status(500).json({ error: "Failed to create idea" });
  }
});

// Update an idea
router.put("/:id", async (req, res) => {
  try {
    const { error, value } = updateIdeaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = await getUserId(req.auth?.userId);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { id } = req.params;
    
    // Check if idea exists and belongs to user
    const existingResult = await query(
      "SELECT id FROM ideas WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: STR_IDEA_NOT_FOUND });
    }

    const updates = [];
    const params = [];
    let paramIndex = 1;

    Object.entries(value).forEach(([key, val]) => {
      if (val !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        params.push(key === "tags" ? JSON.stringify(val) : val);
        paramIndex++;
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push("updated_at = NOW()");
    params.push(id, userId);

    const queryText = `
      UPDATE ideas 
      SET ${updates.join(", ")} 
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} 
      RETURNING *
    `;

    const result = await query(queryText, params);
    logger.info(`Idea updated: ${id} by user ${userId}`);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Error updating idea:", error);
    res.status(500).json({ error: "Failed to update idea" });
  }
});

// Delete an idea
router.delete("/:id", async (req, res) => {
  try {
    const userId = await getUserId(req.auth?.userId);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { id } = req.params;
    const result = await query(
      "DELETE FROM ideas WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: STR_IDEA_NOT_FOUND });
    }

    logger.info(`Idea deleted: ${id} by user ${userId}`);
    res.json({ message: "Idea deleted successfully", id });
  } catch (error) {
    logger.error("Error deleting idea:", error);
    res.status(500).json({ error: "Failed to delete idea" });
  }
});

export default router;