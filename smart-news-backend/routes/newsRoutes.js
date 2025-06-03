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
    const news = await News.find({ isApproved: true, isRejected: false })
                           .sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    logError(err, 'Gagal mengambil berita publik');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita.' });
  }
});

// GET berita tunggal berdasarkan ID (publik, tapi hanya jika disetujui)
// Path: /api/news/:id
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    }
    // Jika berita belum disetujui, dan bukan admin yang melihat, tolak akses
    // req.user bisa tidak ada jika user tidak login, jadi cek juga keberadaannya.
    if (!news.isApproved && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Berita ini belum disetujui dan tidak dapat diakses publik.' });
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
// Berita yang dipost oleh user biasa akan memiliki isApproved: false secara default
// Berita yang dipost oleh admin akan memiliki isApproved: true secara default
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, image, excerpt } = req.body;

    // Validasi input dasar
    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan konten berita wajib diisi.' });
    }

    const isUserAdmin = req.user.role === 'admin';

    const newArticle = new News({
      title,
      // Jika excerpt tidak disediakan, potong dari content
      excerpt: excerpt || content.slice(0, 150) + (content.length > 150 ? '...' : ''),
      content,
      image,
      author: req.user.name, // Penulis adalah nama user yang login (dari token)
      isApproved: isUserAdmin, // Otomatis disetujui jika admin yang membuat
      isRejected: false, // Pastikan tidak ditolak secara default
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
    const isAuthor = news.author === req.user.name; // Membandingkan nama penulis

    // Logika Otorisasi untuk Mengedit Berita
    if (!isUserAdmin) { // Jika bukan admin
      if (!isAuthor) { // Dan bukan penulisnya
        return res.status(403).json({ error: 'Anda tidak diizinkan mengedit berita ini (bukan penulis atau admin).' });
      }
      // Jika penulis, cek apakah berita sudah disetujui/ditolak
      if (news.isApproved || news.isRejected) {
        return res.status(403).json({ error: 'Anda tidak dapat mengedit berita yang sudah disetujui atau ditolak.' });
      }
      // Jika user biasa, hanya boleh mengedit konten berita, bukan status persetujuan
      const allowedUserUpdates = ['title', 'excerpt', 'content', 'image'];
      for (const key in req.body) {
        if (!allowedUserUpdates.includes(key)) {
          return res.status(403).json({ error: `Anda tidak diizinkan mengubah field '${key}'.` });
        }
      }
    }

    // Update berita dengan data dari req.body
    Object.assign(news, req.body);

    // Pastikan excerpt terupdate jika content berubah dan excerpt kosong
    if (req.body.content && !req.body.excerpt) {
      news.excerpt = req.body.content.slice(0, 150) + (req.body.content.length > 150 ? '...' : '');
    }

    const updatedNews = await news.save();
    res.json({ message: 'Berita berhasil diupdate.', news: updatedNews });
  } catch (err) {
    logError(err, 'Gagal mengupdate berita');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengupdate berita.' });
  }
});


// --- Rute Khusus Admin (Membutuhkan auth & isAdmin middleware) ---

// GET semua user (proteksi: hanya admin)
// Catatan: Rute ini lebih baik berada di userRoutes.js atau adminRoutes.js terpisah
// Untuk saat ini, diletakkan di sini, tapi pastikan path-nya tidak konflik.
// Perhatian: /users akan bentrok dengan /:id jika diletakkan setelahnya. Pindahkan ke atas jika perlu.
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Jangan kirim password ke klien
    res.json(users);
  } catch (err) {
    logError(err, 'Gagal mengambil daftar pengguna');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil daftar pengguna.' });
  }
});

// GET semua berita (termasuk yang belum disetujui/ditolak) (proteksi: hanya admin)
// Path: /api/news/admin/all
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const allNews = await News.find().sort({ createdAt: -1 });
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
      { isApproved: true, isRejected: false }, 
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
      { isApproved: false, isRejected: true }, // Pastikan isApproved diset false saat ditolak
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