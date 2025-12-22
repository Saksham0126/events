const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User'); 

// @route   GET /api/events
// @desc    Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('user', ['name', 'logoUrl']) // Matches new User model
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/events/create
// @desc    Create a new event
router.post('/create', auth, async (req, res) => {
  try {
    const { title, description, date, location } = req.body;

    const newEvent = new Event({
      user: req.user.id, // Correctly saves logged-in User ID
      title,
      description,
      date,
      location
    });

    const event = await newEvent.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/events/my-events
// @desc    Get events for the logged-in club
router.get('/my-events', auth, async (req, res) => {
  try {
    // Find events belonging to this user
    const events = await Event.find({ user: req.user.id }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    // Strict check: Only the creator can delete
    if (event.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;