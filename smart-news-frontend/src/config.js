// smart-news-frontend/src/config.js

const config = {
  // GANTI DENGAN URL BACKEND ANDA YANG DI-DEPLOY DI RENDER
  API_BASE_URL: process.env.NODE_ENV === 'production'
    ? 'smart-news-hub-production.up.railway.app' 
    : 'http://localhost:5000',
};

export default config;