// smart-news-backend/models/News.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');

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
    default: 'umum'
  },
  kategori_nama: {
    type: String,
    default: 'Umum'
  },
  status: {
    type: String,
    enum: ['Public', 'Draft', 'Pending', 'ReviewDelete'],
    default: 'Pending'
  },
  deskripsi: {
    type: String,
    required: true
  },
  gambar: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
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

// Pre-save hook untuk menghasilkan slug dan slug kategori
newsSchema.pre('save', async function (next) {
  // Slug untuk judul
  if (this.isModified('judul')) {
    let newSlug = slugify(this.judul, { lower: true, strict: true });
    let counter = 1;
    let originalSlug = newSlug;
    while (await this.constructor.findOne({ slug: newSlug })) {
      newSlug = `${originalSlug}-${counter}`;
      counter++;
    }
    this.slug = newSlug;
  }

  // Slugify kategori dan simpan nama asli
  if (this.isModified('kategori')) {
    this.kategori_nama = this.kategori; // simpan nama asli
    this.kategori = slugify(this.kategori, { lower: true, strict: true });
  }

  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('News', newsSchema);
