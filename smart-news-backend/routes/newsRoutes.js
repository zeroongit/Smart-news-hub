// smart-news-backend/routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const News = require('../models/News');
const User = require('../models/User'); // Pastikan User model diimpor
const auth = require('../middleware/auth'); // Pastikan middleware auth diimpor
const isAdmin = require('../middleware/isAdmin'); // Pastikan middleware isAdmin diimpor

const logError = (err, message) => {
  console.error(`${message}:`, err.message);
};

// --- Rute untuk Pengguna Tanpa Login (Public Access) ---

// GET semua berita yang sudah disetujui (untuk tampilan utama/publik)
// Sekarang menerima query params untuk search dan category
// Path: /api/news
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query; // Ambil parameter dari query string
    let query = { status: 'Public' }; // Default: hanya berita publik

    if (search) {
      // Menambahkan filter pencarian berdasarkan judul atau deskripsi (case-insensitive)
      query.$or = [
        { judul: { $regex: search, $options: 'i' } }, // Menggunakan 'judul' (koreksi)
        { deskripsi: { $regex: search, $options: 'i' } } // Menggunakan 'deskripsi' (koreksi)
      ];
    }

    if (category) {
      // Menambahkan filter kategori (case-insensitive)
      query.kategori = { $regex: category, $options: 'i' }; // Menggunakan 'kategori' (koreksi)
    }

    const news = await News.find(query)
                           .sort({ created_at: -1 }); // Urutkan dari yang terbaru
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
      kategori: { $regex: categoryName, $options: 'i' } // Menggunakan 'kategori' (koreksi)
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
      kategori: { $regex: categoryName, $options: 'i' } // Menggunakan 'kategori' (koreksi)
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
    // Menggunakan distinct untuk mendapatkan nilai unik dari field 'kategori'
    // Filter hanya kategori dari berita 'Public' jika ingin membatasi
    const uniqueCategories = await News.distinct('kategori', { status: 'Public' }); // Menggunakan 'kategori'
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

// POST berita baru (proteksi: otentikasi)
// Path: /api/news
// Setiap user yang login bisa membuat berita, status default Pending
router.post('/', auth, async (req, res) => { // Mengubah isAdmin menjadi hanya auth
  try {
    const { judul, deskripsi, gambar, kategori } = req.body; // Menggunakan properti model backend (koreksi)
    const news = new News({
      judul,
      deskripsi,
      gambar,
      kategori: kategori || 'Umum',
      user_id: req.user._id, // Penulis adalah pengguna yang sedang login (ID user dari token)
      penulis: req.user.username, // Penulis adalah username dari token
      status: 'Pending' // Berita baru biasanya berstatus 'Pending' untuk disetujui admin
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
    const { judul, deskripsi, gambar, kategori } = req.body; // Menggunakan properti model backend (koreksi)
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    }

    // Hanya admin atau pemilik berita yang dapat memperbarui
    if (req.user.role !== 'admin' && news.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Anda tidak memiliki izin untuk memperbarui berita ini.' });
    }

    news.judul = judul || news.judul; // Menggunakan 'judul' (koreksi)
    news.deskripsi = deskripsi || news.deskripsi; // Menggunakan 'deskripsi' (koreksi)
    news.gambar = gambar || news.gambar; // Menggunakan 'gambar' (koreksi)
    news.kategori = kategori || news.kategori; // Menggunakan 'kategori' (koreksi)
    news.updated_at = Date.now();
    news.status = 'Pending'; // Berita yang diperbarui kembali ke status pending

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

    // Hanya admin atau pemilik berita yang dapat meminta penghapusan
    if (req.user.role !== 'admin' && news.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Anda tidak memiliki izin untuk meminta penghapusan berita ini.' });
    }

    // Mengubah status menjadi 'ReviewDelete'
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
// Path: /api/news/user/:userId
// User bisa melihat berita dia sendiri. Admin bisa melihat berita user lain.
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Admin bisa melihat semua berita user lain
    // User biasa hanya bisa melihat berita mereka sendiri
    if (req.user.role !== 'admin' && req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Anda tidak memiliki izin untuk melihat berita pengguna lain.' });
    }

    const news = await News.find({ user_id: req.params.userId }) // Menggunakan 'user_id' (koreksi)
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
