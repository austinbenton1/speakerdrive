import express from 'express';
import cors from 'cors';
import emailFinderRouter from './api/emailFinder.js';

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Add email finder routes
app.use('/api/email-finder', emailFinderRouter);

// Existing routes remain the same...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});