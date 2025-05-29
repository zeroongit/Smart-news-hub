const express = require('express');
const router = express.Router();
const News = require('../models/News');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin'); 

// route user tanpa login
router.get('/', async (req, res) => {
  try {
    const news = await News.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil berita' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'Berita tidak ditemukan' });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil berita' });
  }
});

// route melihat user
router.get('/users', auth, isAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// route untuk admin
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const allNews = await News.find().sort({ createdAt: -1 });
    res.json(allNews);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil semua berita' });
  }
});

router.put('/approve/:id', auth, isAdmin, async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menyetujui berita' });
  }
});

router.put('/reject/:id', auth, isAdmin, async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, isRejected: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menolak berita' });
  }
})

router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Berita tidak ditemukan' });
    res.json({ message: 'Berita berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus berita' });
  }
});


// Proteksi route: hanya user login bisa post
router.post('/', auth, async (req, res) => {
  try {
    const { title, excerpt, content, image, author, createdAt } = req.body;

    const newArticle = new News({
      title,
      excerpt: excerpt || content.slice(0, 100),
      content,
      image,
      author: author || req.user.name,
      createdAt: createdAt || new Date()
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat berita' });
  }
});

// Hanya login yang bisa edit 
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Berita tidak ditemukan' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengupdate berita' });
  }
});


module.exports = router;