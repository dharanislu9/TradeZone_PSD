// routes/event.js
const express = require('express');
const router = express.Router();
const Event = require('../models/event');

// Fetch events by category code
router.get('/events/:categoryCode', async (req, res) => {
  const { categoryCode } = req.params;

  try {
    const events = await Event.find({ categoryCode });
    if (events.length > 0) {
      res.status(200).json(events);
    } else {
      res.status(404).json({ message: 'No events found for this category' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

module.exports = router;
