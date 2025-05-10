const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
    title: {type: String, required: true},
    excerpt: {type: String},
    content: {type: String},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('News, newSchema');
