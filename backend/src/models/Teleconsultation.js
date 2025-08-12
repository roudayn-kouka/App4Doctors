const mongoose = require('mongoose');

const teleconsultationSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledTime: Date,
  duration: Number,
  type: String,
  platform: String,
  meetingUrl: String,
  status: { type: String, enum: ['Scheduled', 'Completed'], default: 'Scheduled' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Teleconsultation', teleconsultationSchema);
