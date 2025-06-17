// smart-news-backend/routes/newsRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const News = require('../models/News');
const User = require('../models/User');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const logError = (err, message) => {
  console.error(`${message}:`, err.message);
};

// --- Rute Public ---

router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { status: 'Public' };

    if (search) {
      query.$or = [
        { judul: { $regex: search, $options: 'i' } },
        { deskripsi: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.kategori = category;
    }

    const news = await News.find(query).sort({ created_at: -1 });
    res.json(news);
  } catch (err) {
    logError(err, 'Gagal mengambil daftar berita publik');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita.' });
  }
});

router.get('/category/:categorySlug', async (req, res) => {
  try {
    const categorySlug = req.params.categorySlug;
    const news = await News.find({
      status: 'Public',
      kategori: categorySlug
    }).sort({ created_at: -1 });
    res.json(news);
  } catch (err) {
    logError(err, `Gagal mengambil berita berdasarkan kategori '${req.params.categorySlug}'`);
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita berdasarkan kategori.' });
  }
});

router.get('/category/:categorySlug/:id', async (req, res) => {
  try {
    const { categorySlug, id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID tidak valid' });
    }
    const news = await News.findOne({
      _id: id,
      status: 'Public',
      kategori: categorySlug
    });
    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan atau tidak dapat diakses di kategori ini.' });
    }
    res.json(news);
  } catch (err) {
    logError(err, `Gagal mengambil berita tunggal dengan ID ${req.params.id}`);
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita.' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const uniqueCategories = await News.distinct('kategori', { status: 'Public' });
    res.json(uniqueCategories);
  } catch (err) {
    logError(err, 'Gagal mengambil daftar kategori unik');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil kategori.' });
  }
});

// --- Rute Terproteksi: User ---

router.post('/', auth, async (req, res) => {
  try {
    const { judul, deskripsi, gambar, kategori } = req.body;
    const news = new News({
      judul,
      deskripsi,
      gambar,
      kategori: kategori || 'Umum',
      kategori_nama: kategori || 'Umum',
      user_id: req.user._id,
      penulis: req.user.username,
      status: 'Pending'
    });
    await news.save();
    res.status(201).json({ message: 'Berita berhasil dibuat dan menunggu persetujuan.', news });
  } catch (err) {
    logError(err, 'Gagal membuat berita');
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { judul, deskripsi, gambar, kategori } = req.body;
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    if (req.user.role !== 'admin' && news.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Tidak punya izin.' });
    }
    news.judul = judul || news.judul;
    news.deskripsi = deskripsi || news.deskripsi;
    news.gambar = gambar || news.gambar;
    news.kategori = kategori || news.kategori;
    news.kategori_nama = kategori || news.kategori_nama;
    news.status = 'Pending';
    news.updated_at = Date.now();
    await news.save();
    res.json({ message: 'Berita diperbarui & menunggu persetujuan.', news });
  } catch (err) {
    logError(err, 'Gagal memperbarui berita');
    res.status(500).json({ error: 'Terjadi kesalahan server saat memperbarui berita.' });
  }
});

// PUT request delete berita
router.put('/request-delete/:id', auth, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    if (req.user.role !== 'admin' && news.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Tidak punya izin.' });
    }
    news.status = 'ReviewDelete';
    news.updated_at = Date.now();
    await news.save();
    res.json({ message: 'Permintaan penghapusan diajukan.', news });
  } catch (err) {
    logError(err, 'Gagal request delete berita');
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

// GET berita berdasarkan user ID
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Tidak punya izin.' });
    }
    const news = await News.find({ user_id: req.params.userId }).sort({ created_at: -1 });
    res.json(news);
  } catch (err) {
    logError(err, 'Gagal mengambil berita user');
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

// --- Rute Admin ---

// PUT setujui berita
router.put('/approve/:id', auth, isAdmin, async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(req.params.id, { status: 'Public', updated_at: Date.now() }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    res.json({ message: 'Berita disetujui.', news: updated });
  } catch (err) {
    logError(err, 'Gagal menyetujui berita');
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

// PUT tolak berita
router.put('/reject/:id', auth, isAdmin, async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(req.params.id, { status: 'Draft', updated_at: Date.now() }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    res.json({ message: 'Berita ditolak.', news: updated });
  } catch (err) {
    logError(err, 'Gagal menolak berita');
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

// DELETE berita oleh admin
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    res.json({ message: 'Berita dihapus.' });
  } catch (err) {
    logError(err, 'Gagal menghapus berita');
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

// GET semua berita (admin)
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const news = await News.find().sort({ created_at: -1 });
    res.json(news);
  } catch (err) {
    logError(err, 'Gagal mengambil semua berita');
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;