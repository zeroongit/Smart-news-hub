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
router.get('/category/:categoryName/:id', async (req, res) => {
  try {
    const { categoryName, id } = req.params;
    const news = await News.findOne({
      _id: id,
      status: 'Public',
      kategori: { $regex: categoryName, $options: 'i' }
    });
    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan atau tidak dapat diakses di kategori ini.' });
    }
    res.json(news);
  } catch (err) {
    logError(err, `Gagal mengambil berita tunggal dengan ID ${req.params.id} di kategori ${req.params.categoryName}`);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Format ID berita tidak valid.' });
    }
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita.' });
  }
});

// BARU: GET semua kategori unik dari berita yang sudah dipublikasi
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


// --- Rute Otentikasi ---
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
router.post('/', auth, async (req, res) => {
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

// PUT memperbarui berita (proteksi: admin atau penulisnya)
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

// BARU: Rute untuk meminta penghapusan berita (oleh penulisnya atau admin)
// Path: /api/news/request-delete/:id
router.put('/request-delete/:id', auth, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    }
    if (req.user.role !== 'admin' && news.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Anda tidak memiliki izin untuk meminta penghapusan berita ini.' });
    }
    news.status = 'ReviewDelete';
    news.updated_at = Date.now();
    await news.save();

    res.json({ message: 'Permintaan penghapusan berita telah diajukan ke admin.', news });
  } catch (err) {
    logError(err, 'Gagal mengajukan permintaan penghapusan berita');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengajukan permintaan penghapusan.' });
  }
});


// GET berita berdasarkan user_id (proteksi: otentikasi)
// User bisa melihat berita dia sendiri. Admin bisa melihat berita user lain.
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
