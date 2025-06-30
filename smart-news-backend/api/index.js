const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const helmet = require('helmet');
const { mongoSanitize } = require('./middleware/mongoSanitize');
app.use(mongoSanitize());



// --- Konfigurasi CORS (izin frontend dari Vercel) ---
const corsOptions = {
  origin: ['https://smart-news-hub.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());

// --- Koneksi MongoDB ---
const MONGO_URI = process.env.MONGO_URI;
let isConnected = false;

async function connectDb() {
  if (isConnected) {
    console.log('✅ MongoDB already connected.');
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('✅ MongoDB connected successfully (Serverless Function).');
  } catch (err) {
    console.error('❌ MongoDB connection error (Serverless Function):', err);
  }
}

// --- Routing ---
const newsRoutes = require('../routes/newsRoutes');
const authRoutes = require('../routes/authRoutes');
const uploadRoutes = require('../routes/uploadRoutes'); 
const UserRoutes = require('../routes/UserRoutes');

app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes); 
app.use('/api/users', UserRoutes);
app.use(helmet());

// --- Endpoint root ---
app.get('/api', async (req, res) => {
  await connectDb(); 
  res.send('✅ Smart News Hub API (Serverless) is running');
});

// --- Inisialisasi koneksi awal ---
connectDb();

module.exports = app;
