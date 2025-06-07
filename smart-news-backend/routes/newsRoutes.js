// smart-news-backend/routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const News = require('../models/News');
const User = require('../models/User'); // Pastikan User model diimpor
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Helper untuk log error (opsional, bisa diintegrasikan dengan Winston/Morgan di production)
const logError = (err, message) => {
  console.error(`${message}:`, err.message);
  // console.error(err.stack); // Uncomment for more detailed stack trace
};

// --- Rute untuk Pengguna Tanpa Login (Public Access) ---

// GET semua berita yang sudah disetujui (untuk tampilan utama/publik)
// Path: /api/news
router.get('/', async (req, res) => {
  try {
    // Mengambil berita dengan status 'Public'
    const news = await News.find({ status: 'Public' })
                           .sort({ created_at: -1 }); // Sesuaikan dengan created_at
    res.json(news);
  } catch (err) {
    logError(err, 'Gagal mengambil berita publik');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita.' });
  }
});

// GET berita tunggal berdasarkan ID (publik, tapi hanya jika statusnya Public)
// Path: /api/news/:id
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    }
    // Jika berita belum Public, dan bukan admin yang melihat, tolak akses
    // req.user bisa tidak ada jika user tidak login, jadi cek juga keberadaannya.
    if (news.status !== 'Public' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Berita ini belum dipublikasikan dan tidak dapat diakses publik.' });
    }
    res.json(news);
  } catch (err) {
    logError(err, 'Gagal mengambil detail berita');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil detail berita.' });
  }
});


// --- Rute untuk Pengguna Login (User Biasa & Admin) ---

// POST berita baru (proteksi: hanya user yang login bisa post)
// Path: /api/news
// Berita yang dipost oleh user biasa akan memiliki status: 'Pending' secara default
// Berita yang dipost oleh admin akan memiliki status: 'Public' secara default
router.post('/', auth, async (req, res) => {
  try {
    const { judul, deskripsi, gambar, kategori } = req.body; // Sesuaikan dengan field baru

    // Validasi input dasar
    if (!judul || !deskripsi) {
      return res.status(400).json({ error: 'Judul dan deskripsi berita wajib diisi.' });
    }

    const isUserAdmin = req.user.role === 'admin';

    const newArticle = new News({
      user_id: req.user.id, // Ambil user_id dari token user yang login
      judul, // Gunakan judul
      penulis: req.user.name, // Penulis adalah nama user yang login (dari token)
      kategori: kategori || 'Umum', // Tambahkan kategori, default 'Umum'
      status: isUserAdmin ? 'Public' : 'Pending', // Otomatis Public jika admin, Pending jika user biasa
      deskripsi, // Gunakan deskripsi sebagai konten utama
      gambar, // Gunakan gambar
      // slug akan digenerate otomatis di model jika ada logika atau bisa ditambahkan di sini
      // Misalnya: slug: judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '')
    });

    await newArticle.save();
    res.status(201).json({ message: 'Berita berhasil dibuat.', news: newArticle });
  } catch (err) {
    logError(err, 'Gagal membuat berita');
    res.status(500).json({ error: 'Terjadi kesalahan server saat membuat berita.' });
  }
});

// PUT/Edit berita (proteksi: hanya user yang login bisa edit, dengan batasan)
// Path: /api/news/:id
// Admin bisa edit semua berita, user biasa hanya bisa edit berita mereka sendiri
router.put('/:id', auth, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    }

    const isUserAdmin = req.user.role === 'admin';
    // Gunakan user_id untuk cek kepemilikan
    const isAuthor = news.user_id === req.user.id; 

    // Logika Otorisasi untuk Mengedit Berita
    if (!isUserAdmin) { // Jika bukan admin
      if (!isAuthor) { // Dan bukan penulisnya
        return res.status(403).json({ error: 'Anda tidak diizinkan mengedit berita ini (bukan penulis atau admin).' });
      }
      // Jika penulis, cek apakah berita sudah dipublikasikan/ditolak
      // Asumsi: status 'Public' atau 'Draft' (jika sudah diubah admin) tidak bisa diubah user biasa
      if (news.status === 'Public') {
        return res.status(403).json({ error: 'Anda tidak dapat mengedit berita yang sudah dipublikasikan.' });
      }
      // Jika user biasa, hanya boleh mengedit konten berita, bukan status
      const allowedUserUpdates = ['judul', 'deskripsi', 'gambar', 'kategori']; // Sesuaikan field yang boleh diubah
      for (const key in req.body) {
        if (!allowedUserUpdates.includes(key)) {
          return res.status(403).json({ error: `Anda tidak diizinkan mengubah field '${key}'.` });
        }
      }
      // Set status kembali ke Pending jika user biasa mengedit berita yang belum Public
      // Ini akan membuat admin harus menyetujui ulang perubahan
      news.status = 'Pending';
    }

    // Update berita dengan data dari req.body
    // Pastikan hanya field yang ada di skema News yang diupdate
    if (req.body.judul) news.judul = req.body.judul;
    if (req.body.deskripsi) news.deskripsi = req.body.deskripsi;
    if (req.body.gambar) news.gambar = req.body.gambar;
    if (req.body.kategori) news.kategori = req.body.kategori;

    // Admin bisa mengubah status, user biasa tidak boleh
    if (isUserAdmin && req.body.status) {
        // Hanya izinkan status yang valid dari enum: Public, Draft, Pending
        const validStatuses = ['Public', 'Draft', 'Pending'];
        if (validStatuses.includes(req.body.status)) {
            news.status = req.body.status;
        } else {
            return res.status(400).json({ error: `Status '${req.body.status}' tidak valid.` });
        }
    }
    
    // Perbarui updated_at
    news.updated_at = Date.now();

    const updatedNews = await news.save();
    res.json({ message: 'Berita berhasil diupdate.', news: updatedNews });
  } catch (err) {
    logError(err, 'Gagal mengupdate berita');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengupdate berita.' });
  }
});


// --- Rute Khusus Admin (Membutuhkan auth & isAdmin middleware) ---

// GET semua user (proteksi: hanya admin)
// Path: /api/news/users (Catatan: Ini akan konflik dengan /api/news/:id jika :id adalah 'users'.
// Disarankan memindahkan rute ini ke adminRoutes.js atau userRoutes.js terpisah)
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Jangan kirim password ke klien
    res.json(users);
  } catch (err) {
    logError(err, 'Gagal mengambil daftar pengguna');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil daftar pengguna.' });
  }
});

// GET semua berita (termasuk yang Draft, Pending, Public) (proteksi: hanya admin)
// Path: /api/news/admin/all
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const allNews = await News.find().sort({ created_at: -1 }); // Sesuaikan dengan created_at
    res.json(allNews);
  } catch (err) {
    logError(err, 'Gagal mengambil semua berita untuk admin');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil semua berita.' });
  }
});

// PUT menyetujui berita (proteksi: hanya admin)
// Path: /api/news/approve/:id
router.put('/approve/:id', auth, isAdmin, async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(
      req.params.id,
      { status: 'Public', updated_at: Date.now() }, // Set status ke 'Public'
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    }
    res.json({ message: 'Berita berhasil disetujui.', news: updated });
  } catch (err) {
    logError(err, 'Gagal menyetujui berita');
    res.status(500).json({ error: 'Terjadi kesalahan server saat menyetujui berita.' });
  }
});

// PUT menolak berita (proteksi: hanya admin)
// Path: /api/news/reject/:id
router.put('/reject/:id', auth, isAdmin, async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(
      req.params.id,
      { status: 'Draft', updated_at: Date.now() }, // Set status ke 'Draft' atau 'Pending' saat ditolak
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    }
    res.json({ message: 'Berita berhasil ditolak.', news: updated });
  } catch (err) {
    logError(err, 'Gagal menolak berita');
    res.status(500).json({ error: 'Terjadi kesalahan server saat menolak berita.' });
  }
});

// DELETE berita (proteksi: hanya admin)
// Path: /api/news/:id
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    }
    res.json({ message: 'Berita berhasil dihapus.' });
  } catch (err) {
    logError(err, 'Gagal menghapus berita');
    res.status(500).json({ error: 'Terjadi kesalahan server saat menghapus berita.' });
  }
});

module.exports = router;