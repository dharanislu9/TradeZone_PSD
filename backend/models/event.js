// backend/models/event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  imageUrl: { type: String }
});

module.exports = mongoose.model('Event', eventSchema);