// smart-news-backend/routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const News = require('../models/News');
const User = require('../models/User');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const logError = (err, message) => {
  console.error(`${message}:`, err.message);
};

// --- Rute untuk Pengguna Tanpa Login (Public Access) ---

// GET semua berita yang sudah disetujui (untuk tampilan utama/publik)
// Sekarang menerima query params untuk search dan category
// Path: /api/news
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
      query.kategori = { $regex: category, $options: 'i' };
    }

    const news = await News.find(query)
                           .sort({ created_at: -1 });
    res.json(news);
  } catch (err) {
    logError(err, 'Gagal mengambil berita publik dengan filter');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita.' });
  }
});

// GET semua berita berdasarkan kategori (publik)
// Path: /api/news/category/:categoryName
router.get('/category/:categoryName', async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    const news = await News.find({
      status: 'Public',
      kategori: { $regex: categoryName, $options: 'i' }
    }).sort({ created_at: -1 });
    res.json(news);
  } catch (err) {
    logError(err, `Gagal mengambil berita berdasarkan kategori '${req.params.categoryName}'`);
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita berdasarkan kategori.' });
  }
});

// GET berita tunggal berdasarkan ID dan kategori (publik)
// Path: /api/news/category/:categoryName/:id
router.get('/category/:categoryName/:id', async (req, res) => {
  console.log(`Backend: Request received for /category/${req.params.categoryName}/${req.params.id}`); // <--- DEBUG LOG BARU
  try {
    const { categoryName, id } = req.params;
    const news = await News.findOne({
      _id: id,
      status: 'Public',
      kategori: { $regex: categoryName, $options: 'i' }
    });
    if (!news) {
      console.log(`Backend: News not found or not public for ID ${id} in category ${categoryName}`); // <--- DEBUG LOG BARU
      return res.status(404).json({ error: 'Berita tidak ditemukan atau tidak dapat diakses di kategori ini.' });
    }
    console.log(`Backend: Found news: ${news.judul}`); // <--- DEBUG LOG BARU
    res.json(news);
  } catch (err) {
    logError(err, `Gagal mengambil berita tunggal dengan ID ${req.params.id} di kategori ${req.params.categoryName}`);
    if (err.name === 'CastError') {
      console.log(`Backend: CastError for ID ${req.params.id}`); // <--- DEBUG LOG BARU
      return res.status(400).json({ error: 'Format ID berita tidak valid.' });
    }
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita.' });
  }
});

// GET semua kategori unik dari berita yang sudah dipublikasi
// Path: /api/news/categories
router.get('/categories', async (req, res) => {
  try {
    const uniqueCategories = await News.distinct('kategori', { status: 'Public' });
    res.json(uniqueCategories);
  } catch (err) {
    logError(err, 'Gagal mengambil daftar kategori unik');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil kategori.' });
  }
});


// ... Rute otentikasi (Auth Routes) ...
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }
    user = new User({ username, email, password, role: role || 'user' });
    await user.save();
    res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });
  } catch (err) {
    logError(err, 'Server error saat register');
    res.status(500).json({ error: 'Terjadi kesalahan server saat registrasi.' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email atau kata sandi salah.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Email atau kata sandi salah.' });
    }

    const token = user.generateAuthToken();
    res.json({ message: 'Login berhasil!', token, role: user.role, username: user.username });
  } catch (err) {
    logError(err, 'Gagal login pengguna');
    res.status(500).json({ error: 'Terjadi kesalahan server saat login.' });
  }
});


// --- Rute Terproteksi (Membutuhkan Otentikasi) ---

// POST berita baru (proteksi: hanya admin)
// Path: /api/news
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { judul, deskripsi, gambar, kategori } = req.body;
    const news = new News({
      judul,
      deskripsi,
      gambar,
      kategori: kategori || 'Umum',
      user_id: req.user._id,
      penulis: req.user.username,
      status: 'Pending'
    });
    await news.save();
    res.status(201).json({ message: 'Berita berhasil dibuat dan menunggu persetujuan admin.', news });
  } catch (err) {
    logError(err, 'Gagal membuat berita');
    res.status(400).json({ error: err.message });
  }
});

// PUT memperbarui berita (proteksi: hanya admin atau penulis)
// Path: /api/news/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { judul, deskripsi, gambar, kategori } = req.body;
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    }

    if (req.user.role !== 'admin' && news.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Anda tidak memiliki izin untuk memperbarui berita ini.' });
    }

    news.judul = judul || news.judul;
    news.deskripsi = deskripsi || news.deskripsi;
    news.gambar = gambar || news.gambar;
    news.kategori = kategori || news.kategori;
    news.updated_at = Date.now();
    news.status = 'Pending';

    await news.save();
    res.json({ message: 'Berita berhasil diperbarui dan menunggu persetujuan.', news });
  } catch (err) {
    logError(err, 'Gagal memperbarui berita');
    res.status(500).json({ error: 'Terjadi kesalahan server saat memperbarui berita.' });
  }
});

// GET berita berdasarkan status (proteksi: hanya admin)
// Path: /api/news/status/:status
router.get('/status/:status', auth, isAdmin, async (req, res) => {
  try {
    const news = await News.find({ status: req.params.status })
                           .sort({ created_at: -1 });
    res.json(news);
  } catch (err) {
    logError(err, `Gagal mengambil berita dengan status ${req.params.status}`);
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita berdasarkan status.' });
  }
});

// GET berita berdasarkan user_id (proteksi: otentikasi)
// Path: /api/news/user/:userId
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Anda tidak memiliki izin untuk melihat berita pengguna lain.' });
    }

    const news = await News.find({ user_id: req.params.userId })
                           .sort({ created_at: -1 });
    res.json(news);
  } catch (err) {
    logError(err, `Gagal mengambil berita berdasarkan pengguna ${req.params.userId}`);
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita berdasarkan pengguna.' });
  }
});


// PUT menyetujui berita (proteksi: hanya admin)
// Path: /api/news/approve/:id
router.put('/approve/:id', auth, isAdmin, async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(
      req.params.id,
      { status: 'Public', updated_at: Date.now() },
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
      { status: 'Draft', updated_at: Date.now() },
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

// GET semua berita (proteksi: hanya admin, tanpa filter status)
// Path: /api/news/admin/all
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const news = await News.find().sort({ created_at: -1 });
    res.json(news);
  } catch (err) {
    logError(err, 'Gagal mengambil semua berita untuk admin');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil semua berita.' });
  }
});

module.exports = router;
