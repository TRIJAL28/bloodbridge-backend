const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Institution = require('../models/Institution');

// ── Register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, type, city, phone, email, password } = req.body;

    if (!name || !type || !city || !phone || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // check if email already exists
    const existing = await Institution.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // hash password manually here instead of relying on pre-save hook
    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const institution = await Institution.create({
      name,
      type,
      city:     city.toLowerCase(),
      phone,
      email:    email.toLowerCase(),
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: institution._id, type: institution.type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Institution registered successfully',
      token,
      institution: {
        id:   institution._id,
        name: institution.name,
        type: institution.type,
        city: institution.city,
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const institution = await Institution.findOne({ email: email.toLowerCase() });
    if (!institution) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, institution.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: institution._id, type: institution.type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      institution: {
        id:   institution._id,
        name: institution.name,
        type: institution.type,
        city: institution.city,
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get institution by ID ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id)
      .select('-password -__v');

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    res.json(institution);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Update inventory ──────────────────────────────────────────
router.patch('/:id/inventory', async (req, res) => {
  try {
    const { inventory } = req.body;

    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { $set: { inventory } },
      { new: true, select: '-password -__v' }
    );

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    res.json({ message: 'Inventory updated', inventory: institution.inventory });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Search by blood group + city ──────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;

    if (!bloodGroup || !city) {
      return res.status(400).json({ message: 'bloodGroup and city are required' });
    }

    const institutions = await Institution.find({
      city: city.toLowerCase(),
      [`inventory.${bloodGroup}`]: { $gt: 0 },
    }).select('-password -__v');

    res.json({ count: institutions.length, institutions });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;