const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { auth } = require('../middleware/auth');
const axios = require('axios');

// Add your RECAPTCHA_SECRET_KEY here if you have it, otherwise validation might fail
const SECRET_KEY = "YOUR_SECRET_KEY"; 

// @route   GET /api/applications/my-applications
// @desc    Get all applications for the logged-in club
router.get('/my-applications', auth, async (req, res) => {
  try {
    // Find applications where clubId matches the logged-in user's ID
    const apps = await Application.find({ clubId: req.user.id }).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/applications/apply
// @desc    Submit a new application (Public)
router.post('/apply', async (req, res) => {
  const { clubId, studentName, studentEmail, rollNumber, reason, captchaToken } = req.body;

  try {
    // Optional: Add CAPTCHA verification here if enabled
    
    const newApp = new Application({
      clubId,
      studentName,
      studentEmail,
      rollNumber,
      reason
    });

    await newApp.save();
    res.json({ msg: 'Application submitted successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (Accept/Reject)
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ msg: 'Application not found' });
    
    // Security check: ensure this application belongs to the logged-in club
    if (app.clubId.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
    }

    app.status = status;
    await app.save();
    res.json(app);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;