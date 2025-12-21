const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  rollNumber: { type: String, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);
