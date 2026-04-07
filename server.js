const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
const donorRoutes       = require('./routes/donors');
const institutionRoutes = require('./routes/institutions');
const requestRoutes     = require('./routes/requests');

app.use('/api/donors',       donorRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/requests',     requestRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'BloodBridge backend is running' });
});

// ── Connect to MongoDB, then start server ────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });