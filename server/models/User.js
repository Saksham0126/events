const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String, // 'super_admin' or 'admin'
    default: 'admin'
  },
  // 👇 NEW FIELD: Controls the "First Login" logic
  mustChangePassword: {
    type: Boolean,
    default: true 
  },
  logoUrl: {
    type: String,
    default: ''
  },
  bannerUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);