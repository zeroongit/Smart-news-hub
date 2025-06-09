// smart-news-backend/api/index.js (File baru ini)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const path = require('path'); // Tidak diperlukan jika tidak melayani file statis lokal
require('dotenv').config(); // Untuk memuat MONGODB_URI dari .env

const app = express();

// --- Konfigurasi CORS (PENTING untuk Vercel) ---
const corsOptions = {
  origin: ['https://smart-news-hub.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Izinkan semua metode yang digunakan API Anda
  credentials: true, // Penting jika Anda menggunakan cookie atau mengirim header Authorization
  optionsSuccessStatus: 204 // Untuk preflight requests
};
app.use(cors(corsOptions));
app.use(express.json());

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
    // throw err; // Melempar error agar Vercel tahu ada masalah startup
  }
}


const newsRoutes = require('../routes/newsRoutes');
const authRoutes = require('../routes/authRoutes');
const uploadRoutes = require('../routes/uploadRoutes'); 
const UserRoutes = require('../routes/UserRoutes');


app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes); 
app.use('/api/users', UserRoutes);

// Rute dasar untuk pengujian
app.get('/api', async (req, res) => {
  await connectDb(); 
  res.send('✅ Smart News Hub API (Serverless) is running');
});

// Jalankan koneksi DB saat aplikasi diinisialisasi
// Ini akan berjalan setiap cold start
connectDb();

// Ekspor aplikasi Express sebagai Serverless Function
module.exports = app;