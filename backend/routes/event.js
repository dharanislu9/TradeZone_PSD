// backend/routes/event.js
const express = require('express');
const { getEvents, addEvent } = require('../controller/event');
const router = express.Router();

router.get('/', getEvents);         // GET all events
router.post('/add', addEvent);       // POST a new event

module.exports = router;