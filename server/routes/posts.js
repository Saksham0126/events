const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary Manually
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Use RAM Storage (Since we proved this works!)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   GET /api/posts/feed
// @desc    Get all posts sorted by newest
// @access  Public
router.get('/feed', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Newest first
      .populate('clubId', 'name logoUrl'); // Get Club Name & Logo too
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/posts/create
// @desc    Upload media and create a post
// @access  Private (Admins Only)
router.post('/create', auth, upload.single('file'), async (req, res) => {
    console.log("🔥 STEP 1: File received in RAM.");

    if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
    }

    try {
        // 3. The "Manual" Upload Stream
        // This takes the buffer from RAM and pipes it to Cloudinary
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "college_clubs",
                        resource_type: "auto", // Auto-detect Image/Video/PDF
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
                // Push the file data into the stream
                stream.end(req.file.buffer);
            });
        };

        // Wait for Cloudinary to finish
        const cloudResult = await uploadToCloudinary();

        // 4. Save to Database
        let mediaType = 'image';
        if (req.file.mimetype.startsWith('video')) mediaType = 'video';
        if (req.file.mimetype === 'application/pdf') mediaType = 'raw';

        const newPost = new Post({
            clubId: req.user.clubId,
            mediaUrl: cloudResult.secure_url, // URL from Cloudinary
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
    // Find posts where the clubId matches the logged-in user
    const posts = await Post.find({ clubId: req.user.clubId }).sort({ createdAt: -1 });
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

    // POWER CHECK:
    // Allow if User owns the post OR User is Super Admin
    if (req.user.role !== 'super_admin' && post.clubId.toString() !== req.user.clubId) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // --- NEW: Cloudinary Cleanup Logic ---
    if (post.mediaUrl) {
      try {
        // 1. Extract Public ID from URL
        // URL is like: .../upload/v1234/college_clubs/filename.png
        const urlParts = post.mediaUrl.split('/');
        const fileWithExt = urlParts[urlParts.length - 1]; // filename.png
        const publicId = `college_clubs/${fileWithExt.split('.')[0]}`; // college_clubs/filename

        // 2. Determine Resource Type (image, video, or raw)
        // Cloudinary needs to know if it's deleting a video or image
        let resourceType = 'image';
        if (post.mediaType === 'video') resourceType = 'video';
        if (post.mediaType === 'raw') resourceType = 'raw';

        // 3. Destroy it
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log(`🗑️ Deleted from Cloudinary: ${publicId}`);
        
      } catch (cloudErr) {
        console.error("Cloudinary Delete Warning:", cloudErr);
        // We continue executing so the DB record still gets deleted
      }
    }
    // -------------------------------------

    await post.deleteOne();
    res.json({ msg: 'Post and media removed' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/posts/club/:clubId
// @desc    Get public posts for a specific club
router.get('/club/:clubId', async (req, res) => {
  try {
    const posts = await Post.find({ clubId: req.params.clubId })
      .sort({ createdAt: -1 })
      .populate('clubId', 'name logoUrl');
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

