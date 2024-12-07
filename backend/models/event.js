// models/event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    imageUrl: { type: String, required: true },
    categoryCode: { type: String, required: true }, // Relates to the category's `code`
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
