import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import App from './App';
import './styles/index.css';
import { validateEnv } from './lib/env';

// Validate environment variables before app initialization
try {
  validateEnv();
} catch (error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; color: #ef4444; text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Configuration Error</h1>
        <p style="font-size: 16px;">Please check your environment configuration.</p>
      </div>
    `;
  }
  console.error('Failed to initialize app:', error);
  throw error;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);