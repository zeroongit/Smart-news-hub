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
// Path: /api/news
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { status: 'Public' }; 

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
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
      category: { $regex: categoryName, $options: 'i' } // Cari kategori secara case-insensitive
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
  try {
    const { categoryName, id } = req.params;
    const news = await News.findOne({
      _id: id,
      status: 'Public',
      category: { $regex: categoryName, $options: 'i' } // Pastikan berita juga cocok dengan kategori
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


// ... Rute otentikasi (Auth Routes) ...
// POST /api/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = new User({ username, email, password, role: role || 'user' }); // Default role 'user'
    await user.save();
    res.status(201).json({ message: 'Registrasi berhasil!' });
  } catch (err) {
    logError(err, 'Gagal registrasi pengguna');
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
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
    const { title, content, imageUrl, category } = req.body;
    const news = new News({
      title,
      content,
      imageUrl,
      category: category || 'Umum', // Default category
      author: req.user._id, // Penulis adalah pengguna yang sedang login
      status: 'Pending' // Berita baru biasanya berstatus 'Pending' untuk disetujui admin
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
    const { title, content, imageUrl, category } = req.body;
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    }

    // Hanya admin atau penulis berita yang dapat memperbarui
    if (req.user.role !== 'admin' && news.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Anda tidak memiliki izin untuk memperbarui berita ini.' });
    }

    news.title = title || news.title;
    news.content = content || news.content;
    news.imageUrl = imageUrl || news.imageUrl;
    news.category = category || news.category;
    news.updated_at = Date.now();
    news.status = 'Pending'; // Berita yang diperbarui kembali ke status pending

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

// GET berita berdasarkan penulis (proteksi: otentikasi)
// Path: /api/news/author/:authorId
router.get('/author/:authorId', auth, async (req, res) => {
  try {
    // Pengguna hanya dapat melihat berita mereka sendiri, kecuali admin
    if (req.user.role !== 'admin' && req.params.authorId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Anda tidak memiliki izin untuk melihat berita pengguna lain.' });
    }

    const news = await News.find({ author: req.params.authorId })
                           .sort({ created_at: -1 });
    res.json(news);
  } catch (err) {
    logError(err, `Gagal mengambil berita berdasarkan penulis ${req.params.authorId}`);
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil berita berdasarkan penulis.' });
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

// GET semua berita (proteksi: hanya admin, tanpa filter status)
// Path: /api/news/admin/all
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    // Mengambil semua berita tanpa filter status
    const news = await News.find().sort({ created_at: -1 });
    res.json(news);
  } catch (err) {
    logError(err, 'Gagal mengambil semua berita untuk admin');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil semua berita.' });
  }
});

module.exports = router;