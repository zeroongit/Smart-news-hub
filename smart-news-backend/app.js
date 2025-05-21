const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.set('bufferCommands', false); // Supaya langsung error kalau belum connect


const newRoutes = require('./routes/newsRoutes');
app.use('/api/news', newRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes)

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error("MongoDB error:", err));

module.exports = app;