const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {  // <--- RENAMED from 'clubId' to 'user'
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to the User/Club model
    required: true
  },
  caption: {
    type: String
  },
  mediaUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String, // 'image' or 'video'
    default: 'image'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);