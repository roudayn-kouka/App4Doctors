const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['doctor', 'patient'], required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  fullName: String,
  phone: String,

  // Médecins
  specialty: String,
  license: String,
  experience: Number,
  languages: [String],
  address: String,
  biography: String,
  notificationPreferences: {
    email: Boolean,
    sms: Boolean,
    appointmentReminders: Boolean,
    emergencyAlerts: Boolean,
    weeklyReports: Boolean
  },
  stats: {
    totalPatients: Number,
    monthlyConsultations: Number,
    averageRating: Number,
    satisfactionRate: Number
  },

  // Patients
  age: Number,
  gender: String,
  bloodGroup: String,
  medicalConditions: [String],
  allergies: [String],
  lastVisit: Date,
  riskScore: Number,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
