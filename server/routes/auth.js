const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: "auto" },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    stream.end(fileBuffer);
  });
};

// @route   GET /api/auth
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      // 👇 SEND THE STATUS FLAG TO FRONTEND
      res.json({ 
        token, 
        role: user.role, 
        mustChangePassword: user.mustChangePassword 
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/auth/change-initial-password
// @desc    First-time password change
router.put('/change-initial-password', auth, async (req, res) => {
  const { newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  try {
    const user = await User.findById(req.user.id);
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // 👇 FLIP THE FLAG (Lock it so they can't change it again without admin)
    user.mustChangePassword = false;
    
    await user.save();
    res.json({ msg: 'Password updated successfully. Account unlocked.' });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/register-club
router.post('/register-club', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'super_admin') return res.status(401).json({ msg: 'Not authorized' });

    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Club already exists' });

    user = new User({ 
      name, 
      email, 
      password, 
      role: 'admin',
      mustChangePassword: true // 👈 NEW CLUBS MUST CHANGE PASSWORD
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.json({ msg: 'Club Registered Successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/auth/all-clubs
router.get('/all-clubs', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'super_admin') return res.status(401).json({ msg: 'Not authorized' });
    const clubs = await User.find({ role: 'admin' }).select('-password');
    res.json(clubs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/clubs', async (req, res) => {
  try {
    const clubs = await User.find({ role: 'admin' }).select('-password');
    res.json(clubs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/club/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'Club not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Club not found' });
    res.status(500).send('Server Error');
  }
});

router.put('/update-banner', auth, upload.single('file'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.file) {
      const url = await uploadToCloudinary(req.file.buffer, "college_clubs/banners");
      user.bannerUrl = url;
    }
    if (req.body.description) user.description = req.body.description;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Banner Upload Error:", err);
    res.status(500).send('Server Error');
  }
});

router.put('/update-logo', auth, upload.single('file'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.file) {
      const url = await uploadToCloudinary(req.file.buffer, "college_clubs/logos");
      user.logoUrl = url;
    }
    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Logo Upload Error:", err);
    res.status(500).send('Server Error');
  }
});

router.delete('/user/:id', auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'super_admin') return res.status(401).json({ msg: 'Not authorized' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Club removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;