import { CHATBOT_CONFIG } from '../config/constants.js';

export function validateChatbotAuth(req, res, next) {
  const { username, password } = CHATBOT_CONFIG.AUTH;
  
  // Add auth headers to the request
  req.headers['Username'] = username;
  req.headers['Password'] = password;
  
  next();
}