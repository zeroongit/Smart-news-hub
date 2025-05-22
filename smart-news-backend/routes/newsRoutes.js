const express = require('express');
const router = express.Router();
const News = require('../models/News');

router.get('/', async (req, res) => {
    try {
        const news = await News.find().sort({ createdAt: -1});
        res.json(news);
    } catch (err) {
      console.error("error backend:", err);
        res.status(500).json({error: 'Gagal mengambil berita'});
    }
});

router.post('/', async (req, res) => {
    try {
        const {title, excerpt, content, image, author, createdAt} = req.body;
        const newArticle = new News ({ 
          title, 
          excerpt: excerpt || content.slice(0, 100), 
          content,
          image,
          author,
          createdAt
        });
        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (err) {
      console.error('POST api/news', err);
      res.status(500).json({ error: 'Gagal membuat berita'});
    }
});

// GET berita berdasarkan ID
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'Berita tidak ditemukan' });
    }
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil berita' });
  }
});

// UPDATE berita
router.put('/:id', async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Berita tidak ditemukan' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengupdate berita' });
  }
});

// DELETE berita
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Berita tidak ditemukan' });
    }
    res.json({ message: 'Berita berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus berita' });
  }
});


module.exports = router;