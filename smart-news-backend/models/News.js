const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const newsSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4
  },
  user_id: {
    type: String,
    required: true
  },
  judul: {
    type: String,
    required: true
  },
  penulis: {
    type: String,
    required: true
  },
  kategori: {
    type: String,
    default: 'Umum'
  },
  status: {
    type: String,
    enum: ['Public', 'Draft', 'Pending'],
    default: 'Pending'
  },
  deskripsi: {
    type: String,
    required: true
  },
  gambar: {
    type: String, // Nama file atau ID unik Google Drive/cloud/local file
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  visitor_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('News', newsSchema);
