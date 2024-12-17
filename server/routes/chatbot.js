import express from 'express';
import { validateChatbotAuth } from '../middleware/auth.js';
import { processChatMessage } from '../services/chatbotService.js';

const router = express.Router();

router.post('/chat', validateChatbotAuth, async (req, res, next) => {
  try {
    const { message } = req.body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Message is required and must be a string'
      });
    }

    // Process message
    const response = await processChatMessage(message);

    // Send response
    res.json(response);
  } catch (error) {
    next(error);
  }
});