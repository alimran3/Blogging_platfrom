import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogs.js';
import userRoutes from './routes/users.js';
import commentRoutes from './routes/comments.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import passwordResetRoutes from './routes/passwordReset.js';
import errorHandler from './middleware/errorHandler.js';
import rateLimiter from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  permissionsPolicy: {
    permissions: {
      unload: ['self']
    }
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://connect.facebook.net", "https://*.facebook.net", "https://www.facebook.com", "https://*.facebook.com", "https://platform.twitter.com", "https://www.instagram.com", "https://apis.google.com"],
      frameSrc: ["'self'", "https://www.facebook.com", "https://web.facebook.com", "https://*.facebook.com", "https://facebook.com", "https://www.youtube.com", "https://player.vimeo.com", "https://www.instagram.com", "https://www.google.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://*.cloudinary.com", "https://*.facebook.com", "https://*.fbcdn.net", "https://*.instagram.com", "https://*.youtube.com", "https://i.ytimg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      connectSrc: ["'self'", "https://api.facebook.com", "https://graph.facebook.com", "https://www.facebook.com", "https://*.facebook.com", "https://*.facebook.net", "https://*.fbcdn.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"]
    }
  }
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/password-reset', passwordResetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Vercel serverless handler
export default async function handler(req, res) {
  // Connect to database if not already connected
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB Connected');
    } catch (error) {
      console.error('DB Connection Error:', error.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  
  app(req, res);
}
