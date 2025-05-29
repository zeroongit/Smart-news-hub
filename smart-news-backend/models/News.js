const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: String,
  content: { type: String, required: true },
  image: String,
  author: String,
  createdAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false }
});

module.exports = mongoose.model('News', newsSchema);
