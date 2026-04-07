const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Institution = require('../models/Institution');

// ── Post a new emergency request ─────────────────────────────
// POST /api/requests
router.post('/', async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      city,
      hospital,
      contactPhone,
      urgency,
      unitsNeeded,
    } = req.body;

    const request = await Request.create({
      patientName,
      bloodGroup,
      city: city.toLowerCase(),
      hospital,
      contactPhone,
      urgency,
      unitsNeeded,
    });

    res.status(201).json({
      message: 'Emergency request posted successfully',
      requestId: request._id,
      request,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get all open requests (for institution dashboard) ────────
// GET /api/requests?city=mathura&bloodGroup=O+
router.get('/', async (req, res) => {
  try {
    const filter = { status: 'open' };

    // optionally filter by city and blood group
    if (req.query.city) filter.city = req.query.city.toLowerCase();
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;

    const requests = await Request.find(filter)
      .sort({ urgency: -1, createdAt: -1 }) // critical first, then newest
      .populate('acceptedBy', 'name type city')
      .select('-__v');

    res.json({ count: requests.length, requests });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Track a single request by ID ─────────────────────────────
// GET /api/requests/:id
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('acceptedBy', 'name type city phone')
      .select('-__v');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Institution accepts a request ────────────────────────────
// PATCH /api/requests/:id/accept
router.patch('/:id/accept', async (req, res) => {
  try {
    const { institutionId } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'open') {
      return res.status(400).json({ message: 'Request is no longer open' });
    }

    // verify institution exists
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    // update request status
    request.status = 'accepted';
    request.acceptedBy = institutionId;
    request.acceptedAt = new Date();
    await request.save();

    res.json({
      message: 'Request accepted successfully',
      request: {
        id: request._id,
        status: request.status,
        acceptedBy: institution.name,
        acceptedAt: request.acceptedAt,
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Mark request as fulfilled ────────────────────────────────
// PATCH /api/requests/:id/fulfil
router.patch('/:id/fulfil', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'fulfilled';
    await request.save();

    res.json({ message: 'Request marked as fulfilled', request });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Cancel a request ─────────────────────────────────────────
// PATCH /api/requests/:id/cancel
router.patch('/:id/cancel', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ message: 'Request cancelled', request });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;