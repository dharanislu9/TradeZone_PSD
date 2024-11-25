const Event = require('../models/event');


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