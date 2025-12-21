const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { auth } = require('../middleware/auth'); // <--- Fixed: Destructure auth

// @route   POST /api/applications/apply
// @desc    Submit a new application (Public)
router.post('/apply', async (req, res) => {
  const { clubId, studentName, studentEmail, rollNumber, reason } = req.body;

  try {
    // Check if already applied
    const existing = await Application.findOne({ clubId, studentEmail });
    if (existing) {
      return res.status(400).json({ msg: 'You have already applied to this club.' });
    }

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

// @route   GET /api/applications/my-applications
// @desc    Get all applications for the logged-in club
router.get('/my-applications', auth, async (req, res) => {
  try {
    // Note: We use req.user.clubId because applications are linked to the Club
    const apps = await Application.find({ clubId: req.user.clubId }).sort({ createdAt: -1 });
    res.json(apps);
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

    // Verify that the logged-in admin owns the club this application is for
    if (app.clubId.toString() !== req.user.clubId) {
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
