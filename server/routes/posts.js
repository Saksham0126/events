const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User'); // Import User for safety
const { auth } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary Manually
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Use RAM Storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   GET /api/posts/feed
// @desc    Get all posts sorted by newest
router.get('/feed', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name logoUrl'); // <--- CHANGED: populating 'user'
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/posts/create
// @desc    Upload media and create a post
router.post('/create', auth, upload.single('file'), async (req, res) => {
    console.log("🔥 STEP 1: File received in RAM.");

    if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
    }

    try {
        // 3. The "Manual" Upload Stream
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "college_clubs",
                        resource_type: "auto", 
                    },
                    (error, result) => {
                        if (result) {
                            console.log("✅ CLOUDINARY SUCCESS:", result.secure_url);
                            resolve(result);
                        } else {
                            console.error("❌ CLOUDINARY ERROR:", error);
                            reject(error);
                        }
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const cloudResult = await uploadToCloudinary();

        // 4. Save to Database
        let mediaType = 'image';
        if (req.file.mimetype.startsWith('video')) mediaType = 'video';
        if (req.file.mimetype === 'application/pdf') mediaType = 'raw';

        const newPost = new Post({
            user: req.user.id, // <--- CHANGED: Saving as 'user', using req.user.id
            mediaUrl: cloudResult.secure_url,
            mediaType: mediaType,
            caption: req.body.caption
        });

        const post = await newPost.save();
        console.log("✅ STEP 2: Saved to MongoDB");
        res.json(post);

    } catch (err) {
        console.error("❌ FINAL ERROR:", err);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// @route   GET /api/posts/my-posts
// @desc    Get only the logged-in club's posts
router.get('/my-posts', auth, async (req, res) => {
  try {
    // <--- CHANGED: Querying 'user' field with req.user.id
    const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post AND its Cloudinary file
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // <--- CHANGED: Checking 'post.user' vs 'req.user.id'
    if (req.user.role !== 'super_admin' && post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Cloudinary Cleanup (Kept your logic)
    if (post.mediaUrl) {
      try {
        const urlParts = post.mediaUrl.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `college_clubs/${fileWithExt.split('.')[0]}`; 

        let resourceType = 'image';
        if (post.mediaType === 'video') resourceType = 'video';
        if (post.mediaType === 'raw') resourceType = 'raw';

        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log(`🗑️ Deleted from Cloudinary: ${publicId}`);
        
      } catch (cloudErr) {
        console.error("Cloudinary Delete Warning:", cloudErr);
      }
    }

    await post.deleteOne();
    res.json({ msg: 'Post and media removed' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/posts/club/:id
// @desc    Get public posts for a specific club
router.get('/club/:id', async (req, res) => { // <--- CHANGED param to :id
  try {
    const posts = await Post.find({ user: req.params.id }) // <--- CHANGED to 'user'
      .sort({ createdAt: -1 })
      .populate('user', 'name logoUrl'); // <--- CHANGED to 'user'
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;