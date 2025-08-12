-- HustleFinder Database Schema
-- Updated for Clerk authentication integration

-- Users table (modified for Clerk integration)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  clerk_id VARCHAR(255) UNIQUE NOT NULL, -- Clerk user ID
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed, archived
  priority INTEGER DEFAULT 1, -- 1-5 priority scale
  deadline DATE,
  budget DECIMAL(10, 2),
  roi_estimated DECIMAL(5, 2), -- ROI percentage
  roi_actual DECIMAL(5, 2), -- Actual ROI percentage
  tags TEXT[], -- Array of tags
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100), -- business, tech, creative, etc.
  match_score INTEGER DEFAULT 0, -- AI matching score 0-100
  implementation_difficulty INTEGER, -- 1-10 scale
  market_potential INTEGER, -- 1-10 scale
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[], -- Array of tags
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROI Calculations table
CREATE TABLE IF NOT EXISTS roi_calculations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  initial_investment DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2),
  time_period_months INTEGER,
  roi_percentage DECIMAL(5, 2),
  calculation_type VARCHAR(50), -- simple, annualized, compound
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Interactions table (for tracking AI conversations)
CREATE TABLE IF NOT EXISTS ai_interactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50), -- chat, analysis, generation
  input_text TEXT,
  output_text TEXT,
  model_used VARCHAR(100),
  tokens_used INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark', -- dark, light, auto
  language VARCHAR(10) DEFAULT 'fr', -- fr, en, etc.
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  ai_assistance_level VARCHAR(20) DEFAULT 'moderate', -- minimal, moderate, aggressive
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_match_score ON ideas(match_score);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_user_id ON roi_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_project_id ON roi_calculations(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);

-- Trigger for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at 
            BEFORE UPDATE ON projects 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ideas_updated_at') THEN
        CREATE TRIGGER update_ideas_updated_at 
            BEFORE UPDATE ON ideas 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at') THEN
        CREATE TRIGGER update_user_preferences_updated_at 
            BEFORE UPDATE ON user_preferences 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;