const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');

// ── Register a new donor ─────────────────────────────────────
// POST /api/donors/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, bloodGroup, city } = req.body;

    // check if donor with this phone already exists
    const existing = await Donor.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const donor = await Donor.create({ name, phone, bloodGroup, city });
    res.status(201).json({ message: 'Donor registered successfully', donor });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Search donors by blood group and city ────────────────────
// GET /api/donors/search?bloodGroup=O+&city=mathura
router.get('/search', async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;

    if (!bloodGroup || !city) {
      return res.status(400).json({ message: 'bloodGroup and city are required' });
    }

    const donors = await Donor.find({
      bloodGroup,
      city: city.toLowerCase(),
      available: true,
    }).select('-__v'); // hide the __v field from response

    res.json({ count: donors.length, donors });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Toggle donor availability ────────────────────────────────
// PATCH /api/donors/:id/availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    donor.available = !donor.available; // flip true to false or false to true
    await donor.save();

    res.json({ message: 'Availability updated', available: donor.available });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get a single donor by ID ─────────────────────────────────
// GET /api/donors/:id
router.get('/:id', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id).select('-__v');
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.json(donor);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;