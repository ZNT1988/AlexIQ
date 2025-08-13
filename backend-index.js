import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://alexiq.site']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'AlexIQ Backend'
  });
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, type = 'general' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Simulate AI response (replace with real AI integration)
    const responses = {
      general: "I'm AlexIQ, your business AI assistant. How can I help you today?",
      business: "Let me analyze your business needs and provide strategic insights.",
      analysis: "I can help you analyze market trends and business opportunities."
    };

    const response = {
      message: responses[type] || responses.general,
      type: type,
      timestamp: new Date().toISOString(),
      model: 'alexiq-v1'
    };

    res.json(response);
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ideas CRUD endpoints
app.get('/api/ideas', (req, res) => {
  // Return mock ideas for now
  res.json({
    ideas: [
      {
        id: 1,
        title: "AI-Powered Market Analysis",
        description: "Automated market research using AI",
        category: "Technology",
        created_at: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/ideas', (req, res) => {
  const { title, description, category } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  // Mock creation response
  res.status(201).json({
    id: Date.now(),
    title,
    description,
    category: category || 'General',
    created_at: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AlexIQ Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Chat: http://localhost:${PORT}/api/ai/chat`);
});

export default app;