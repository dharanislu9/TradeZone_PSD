// backend/controller/event.js
const Event = require('../models/event');

// Fetch all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    console.log("Fetched events from database:", events); // Log the events fetched
    res.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error); // Log the error
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// Add a new event
const addEvent = async (req, res) => {
  const { title, description, startDate, endDate, imageUrl } = req.body;

  const event = new Event({
    title,
    description,
    startDate,
    endDate,
    imageUrl
  });

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(400).json({ message: 'Failed to add event' });
  }
};

module.exports = { getEvents, addEvent };