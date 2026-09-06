// src/config.js
// Centralized API configuration that guarantees reliable connection
// in both production (Render) and local development.

const ENV_API_URL = import.meta.env.VITE_API_URL;

export const API_URL = (() => {
  // If explicitly specified in .env (e.g. Render backend), always use it
  if (ENV_API_URL && ENV_API_URL.trim() !== '') {
    return ENV_API_URL.replace(/\/+$/, '');
  }
  
  // Default to live Render backend
  return 'https://r-links.onrender.com';
})();

export const GITHUB_CLIENT_ID = 'Ov23licc8CPvx9v9fWN9';
