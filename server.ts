import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './db.js';
import uploadRouter, { uploadMiddleware } from './uploadRoute.js';
import { register, login } from './authController.js';
import { authMiddleware, optionalAuthMiddleware } from './authMiddleware.js';
import { 
  uploadResume, 
  getLatestResume,
  handleChatQuery, 
  handleATSScore, 
  handleResumeRewrite, 
  handleKeywordGap 
} from './resumeController.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON and urlencoded data
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Initialize MongoDB Connection
  await connectDB();

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SHALVI AI Resume Optimizer API',
      timestamp: new Date().toISOString()
    });
  });

  // 1. Authentication Routes (JWT based)
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);

  // 2. Resume Upload & Latest Routes
  app.post('/api/resume/upload', optionalAuthMiddleware, uploadMiddleware, uploadResume);
  app.get('/api/resume/latest', optionalAuthMiddleware, getLatestResume);
  app.get('/api/latest-resume', optionalAuthMiddleware, getLatestResume);

  // Direct upload aliases to satisfy all convention paths:
  app.post('/upload', optionalAuthMiddleware, uploadMiddleware, uploadResume);
  app.post('/api/upload', optionalAuthMiddleware, uploadMiddleware, uploadResume);
  app.use('/api/resume', uploadRouter);

  // 3. RAG Chat API Routes
  app.post('/api/chat', optionalAuthMiddleware, handleChatQuery);
  app.post('/chat', optionalAuthMiddleware, handleChatQuery);
  app.post('/api/rag/chat', optionalAuthMiddleware, handleChatQuery);

  // 4. Additional Feature Routes
  app.post('/api/ats/score', handleATSScore);
  app.post('/api/ats-score', handleATSScore);
  app.post('/api/score', handleATSScore);

  app.post('/api/ai/rewrite', handleResumeRewrite);
  app.post('/api/rewrite', handleResumeRewrite);
  app.post('/api/resume/rewrite', handleResumeRewrite);

  app.post('/api/keywords/gap-analysis', handleKeywordGap);
  app.post('/api/keyword-gap', handleKeywordGap);
  app.post('/api/resume/keyword-gap', handleKeywordGap);

  // Vite middleware for development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
