const mongoose = require('mongoose');

const medicalTestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: String,
  file: {
    name: String,
    size: Number,
    url: String
  },
  summary: String,
  keyMetrics: [{
    name: String,
    value: String
  }],
  status: { type: String, enum: ['En attente', 'Traité', 'Validé'], default: 'En attente' },
  date: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalTest', medicalTestSchema);
