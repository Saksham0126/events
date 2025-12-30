// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// Middleware
app.use(express.json()); // Allows server to read JSON data
app.use(cors({
  origin: [
    'http://localhost:5173',                 // Keep this for local development
    'http://127.0.0.1:5173',                 // Keep this for local development
    'https://events-psi-puce.vercel.app'     // Add your Vercel URL here
  ],
  credentials: true
})); // Allows frontend requests

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/events', require('./routes/events'));
app.use('/api/applications', require('./routes/applications'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Simple Test Route
app.get('/', (req, res) => {
  res.send("API is Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

