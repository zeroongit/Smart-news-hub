// smart-news-frontend/src/config.js

const config = {
  // GANTI DENGAN URL BACKEND ANDA YANG DI-DEPLOY DI RENDER
  API_BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://smart-news-hub.vercel.app' 
    : 'http://localhost:5000',
};

export default config;