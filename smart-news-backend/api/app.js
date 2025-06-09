// smart-news-backend/api/index.js (File baru ini)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const path = require('path'); // Tidak diperlukan jika tidak melayani file statis lokal
require('dotenv').config(); // Untuk memuat MONGODB_URI dari .env

const app = express();

// --- Konfigurasi CORS (PENTING untuk Vercel) ---
const corsOptions = {
  origin: smart-news-hub.vercel.app || 'http://localhost:5173', // Default ke localhost untuk development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Izinkan semua metode yang digunakan API Anda
  credentials: true, // Penting jika Anda menggunakan cookie atau mengirim header Authorization
  optionsSuccessStatus: 204 // Untuk preflight requests
};
app.use(cors(corsOptions));
app.use(express.json());

// --- CATATAN: PENANGANAN UPLOADS ---
// Jika Anda sebelumnya memiliki app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Ini tidak akan berfungsi di Vercel Serverless Functions.
// Anda perlu menggunakan layanan penyimpanan cloud (seperti Vercel Blob, AWS S3, dll.)
// untuk menyimpan dan melayani file unggahan di lingkungan produksi.
// Untuk saat ini, baris tersebut dihapus.

// --- Koneksi MongoDB ---
const MONGO_URI = process.env.MONGO_URI;

// Pastikan koneksi Mongoose hanya terhubung sekali
// Pola ini umum untuk serverless functions agar koneksi tetap hidup
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

// Impor Rute Anda
// Pastikan file-file ini ada di direktori yang benar relatif terhadap api/index.js
const newsRoutes = require('../routes/newsRoutes');
const authRoutes = require('../routes/authRoutes');
const uploadRoutes = require('../routes/uploadRoutes'); // Sesuaikan jika Anda akan menangani upload di sini
const UserRoutes = require('../routes/UserRoutes');


// Gunakan Rute API Anda
// Pastikan prefix '/api' sudah ditambahkan di app.js di Vercel config.json
// Contoh jika Anda punya vercel.json dengan rewrite "/api/(.*)" -> "/api"
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes); // Jika Anda memiliki rute upload, pastikan logikanya disesuaikan
app.use('/api/users', UserRoutes);

// Rute dasar untuk pengujian
app.get('/api', async (req, res) => {
  await connectDb(); // Coba koneksi ke DB saat ada request
  res.send('✅ Smart News Hub API (Serverless) is running');
});

// Jalankan koneksi DB saat aplikasi diinisialisasi
// Ini akan berjalan setiap cold start
connectDb();

// Ekspor aplikasi Express sebagai Serverless Function
module.exports = app;