const express = require('express');
const router = express.router();
const News = required('../models/News');

router.get('/', async (req, res) => {
    try {
        const news = await News.find().sort({ createdAT: -1});
        res.json(news);
    } catch (err) {
        res.status(500).json({error: 'Gaagal mengambil berita'});
    }
});

router.post('/', async (req, res) => {
    try {
        const {title, excerpt, content} = req.body;
        const newArticle = new News({ title, excerpt, content});
        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ error: 'Gagal membuat berita'});
    }
});

module.export = router;