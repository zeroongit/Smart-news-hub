const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
app.use(express.json());

const helmet = require('helmet');
const { mongoSanitize } = require('../middleware/mongoSanitize');
app.use(mongoSanitize);

const rateLimit = require('express-rate-limit');

app.set('trust proxy', 'loopback');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Terlalu banyak permintaan dari IP ini. Coba lagi nanti.',
  skip: (req) => req.method === 'OPTIONS' 
});

app.use(limiter);



// --- Konfigurasi CORS (izin frontend dari Vercel) ---
const allowedOrigins = ['https://smart-news-hub.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));
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
