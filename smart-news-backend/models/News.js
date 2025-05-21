const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: String,
  excerpt: String,
  content: String,
  image: String,
  author: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('News', newsSchema);
