import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create and configure app
const createApp = () => {
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

  return app;
};

// Database connection
const connectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

// Vercel serverless handler
export default async function handler(req, res) {
  try {
    await connectDB();
    const app = createApp();
    app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const app = createApp();
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
