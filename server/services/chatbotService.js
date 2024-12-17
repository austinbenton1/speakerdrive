import { CHATBOT_CONFIG } from '../config/constants.js';

class ChatbotError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'ChatbotError';
    this.status = status;
  }
}

export async function processChatMessage(message) {
  try {
    const params = new URLSearchParams({ message });
    const url = `${CHATBOT_CONFIG.API_URL}?${params}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...CHATBOT_CONFIG.HEADERS,
        Username: CHATBOT_CONFIG.AUTH.username,
        Password: CHATBOT_CONFIG.AUTH.password
      }
    });

    if (!response.ok) {
      throw new ChatbotError(
        'Failed to get chatbot response',
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ChatbotError) {
      throw error;
    }
    throw new ChatbotError('Failed to process chat message');
  }
}