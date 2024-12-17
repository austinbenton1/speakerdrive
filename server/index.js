import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import emailFinderRouter from './api/emailFinder.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Add routes
app.use('/api/email-finder', emailFinderRouter);

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Wrap server startup in try-catch
try {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment variables loaded:', {
      NODE_ENV: process.env.NODE_ENV,
      PILOTERR_API_KEY: process.env.PILOTERR_API_KEY ? '✓ Present' : '✗ Missing'
    });
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}