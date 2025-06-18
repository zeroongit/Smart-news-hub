const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });

    const base64Image = req.file.buffer.toString('base64');
    const response = await axios.post('https://api.imgur.com/3/image', {
      image: base64Image,
      type: 'base64'
    }, {
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
      }
    });

    const imageUrl = response.data.data.link;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Imgur upload failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Gagal mengunggah gambar ke Imgur.' });
  }
});

module.exports = router;
