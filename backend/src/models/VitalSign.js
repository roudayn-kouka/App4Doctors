const mongoose = require('mongoose');

const vitalSignSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodPressure: String,
  heartRate: Number,
  temperature: Number,
  oxygenSaturation: Number,
  timestamp: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VitalSign', vitalSignSchema);
