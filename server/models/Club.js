const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  logoUrl: { type: String }, // URL from Cloudinary
  bannerUrl: { type: String }, // URL from Cloudinary
  instagramLink: { type: String }, // Legacy field, kept for backward compatibility
  // This helps us link an Admin to a Club
  adminEmail: { type: String, required: true },
  
  // --- NEW FIELDS ---
  category: { type: String },    // Tech, Art, etc.
  
  socials: {
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },

  // Simple array of team members
  coreTeam: [{
    name: String,
    role: String
  }],
  // ------------------
});

module.exports = mongoose.model('Club', ClubSchema);

