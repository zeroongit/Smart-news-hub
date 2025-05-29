// server.js
const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

mongoose.set('bufferCommands', false); // opsional
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 30000
}).then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch((err) => {
  console.error("❌ Error connecting to MongoDB:", err);
});
