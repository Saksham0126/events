const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Club = require('../models/Club');
const { auth, checkSuperAdmin } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use RAM Storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST /api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if the user exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Check if the password matches
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Find which club this admin manages (if not super_admin)
    let club = null;
    if (admin.clubId) {
      club = await Club.findOne({ _id: admin.clubId });
    }

    // 4. Create the JWT Token
    const payload = {
      user: {
        id: admin._id,
        role: admin.role,
        clubId: admin.clubId || null,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: admin._id,
            role: admin.role,
            email: admin.email,
            clubName: club ? club.name : (admin.role === 'super_admin' ? 'Super Admin' : 'Unknown Club'),
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/auth/clubs
// @desc    Get all registered clubs (Public)
router.get('/clubs', async (req, res) => {
  try {
    // Return all clubs (public info only)
    const clubs = await Club.find({});
    res.json(clubs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/auth/club/:id
// @desc    Get specific club details (Public)
router.get('/club/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ msg: 'Club not found' });
    res.json(club);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Club not found' });
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/create-club
// @desc    Super Admin creates a new Club Account
router.post('/create-club', checkSuperAdmin, async (req, res) => {
  const { name, email, password, category, description } = req.body;

  try {
    // Check if admin with this email already exists
    let admin = await Admin.findOne({ email });
    if (admin) return res.status(400).json({ msg: 'Club admin with this email already exists' });

    // Check if club with this name already exists
    let club = await Club.findOne({ name });
    if (club) return res.status(400).json({ msg: 'Club with this name already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the Club first
    club = new Club({
      name,
      description: description || '',
      adminEmail: email,
      logoUrl: '', // Will be set later
    });

    await club.save();

    // Create the Admin linked to this Club
    admin = new Admin({
      email,
      password: hashedPassword,
      role: 'club_admin', // Standard club role
      clubId: club._id
    });

    await admin.save();
    res.json({ msg: `Club '${name}' created successfully!`, clubId: club._id });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in admin's club info
router.get('/me', auth, async (req, res) => {
  try {
    // Super admin doesn't have a club
    if (req.user.role === 'super_admin') {
      return res.json({ role: 'super_admin', name: 'Super Admin' });
    }

    // Get the club for this admin
    const club = await Club.findById(req.user.clubId);
    if (!club) {
      return res.status(404).json({ msg: 'Club not found' });
    }

    res.json({
      _id: club._id,
      name: club.name,
      description: club.description,
      logoUrl: club.logoUrl,
      category: club.category,
      socials: club.socials || { instagram: '', linkedin: '', website: '' },
      coreTeam: club.coreTeam || [],
      role: req.user.role
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/auth/update-logo
// @desc    Update Club Profile Picture
router.put('/update-logo', auth, upload.single('file'), async (req, res) => {
  try {
    // Super admin can't update a club logo
    if (req.user.role === 'super_admin') {
      return res.status(403).json({ msg: 'Super admin cannot update club logo' });
    }

    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    // 1. Upload to Cloudinary (Stream Method)
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "club_logos", width: 300, crop: "scale" }, // Auto-resize to 300px
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const cloudResult = await uploadToCloudinary();

    // 2. Update Club in DB
    const club = await Club.findById(req.user.clubId);
    if (!club) {
      return res.status(404).json({ msg: 'Club not found' });
    }

    club.logoUrl = cloudResult.secure_url;
    await club.save();

    res.json(club); // Return updated club

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update Club Description, Socials, and Team
router.put('/update-profile', auth, async (req, res) => {
  const { description, socials, coreTeam, category } = req.body;

  try {
    // Super admin can't update a club profile
    if (req.user.role === 'super_admin') {
      return res.status(403).json({ msg: 'Super admin cannot update club profile' });
    }

    const club = await Club.findById(req.user.clubId);
    if (!club) return res.status(404).json({ msg: 'Club not found' });

    // Update fields if they are provided
    if (description !== undefined) club.description = description;
    if (category !== undefined) club.category = category;
    if (socials) club.socials = socials;
    if (coreTeam) club.coreTeam = coreTeam;

    await club.save();
    res.json(club); // Send back the updated profile
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/auth/update-banner
// @desc    Update Club Cover Photo (Banner)
router.put('/update-banner', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role === 'super_admin') {
      return res.status(403).json({ msg: 'Super admin cannot update club banner' });
    }

    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    // Stream upload to Cloudinary (Folder: club_banners)
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "club_banners", resource_type: "image" }, // No cropping, let it be wide
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const cloudResult = await uploadToCloudinary();

    // Update DB
    const club = await Club.findById(req.user.clubId);
    if (!club) return res.status(404).json({ msg: 'Club not found' });
    
    club.bannerUrl = cloudResult.secure_url;
    await club.save();

    res.json({ bannerUrl: club.bannerUrl });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

