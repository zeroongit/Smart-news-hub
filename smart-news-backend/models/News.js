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


newsSchema.pre('save', async function (next) {
  if (this.isModified('judul')) {
    let cleanJudul = this.judul
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/\s+/g, '-') 
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-') 
      .replace(/^-+|-+$/g, '')

    let newSlug = cleanJudul;
    
    let counter = 1;
    let originalSlug = newSlug;
    while (await this.constructor.findOne({ slug: newSlug })) {
      newSlug = `${originalSlug}-${counter}`;
      counter++;
    }
    this.slug = newSlug;
  }


  if (this.isModified('kategori')) {
    this.kategori_nama = this.kategori;
    this.kategori = this.kategori
      .toLowerCase()
      .replace(/&/g, 'and') 
      .replace(/\s+/g, '-') 
      .replace(/[^a-z0-9-]/g, '') 
      .replace(/--+/g, '-') 
      .replace(/^-+|-+$/g, ''); 
  }

  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('News', newsSchema);
