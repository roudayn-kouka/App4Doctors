const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  }
});

const prescriptionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  medications: [medicationSchema],
  status: {
    type: String,
    enum: ['pending', 'sent', 'filled', 'expired'],
    default: 'pending'
  },
  pharmacy: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  prescriptionNumber: {
    type: String,
    unique: true
  },
  validUntil: {
    type: Date,
    default: function() {
      // Default validity: 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  filledDate: {
    type: Date
  },
  pharmacistNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Generate prescription number before saving
prescriptionSchema.pre('save', function(next) {
  if (!this.prescriptionNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.prescriptionNumber = `RX-${timestamp.slice(-6)}-${random}`;
  }
  next();
});

// Check if prescription is expired
prescriptionSchema.virtual('isExpired').get(function() {
  return this.validUntil < new Date();
});

// Auto-expire prescriptions
prescriptionSchema.methods.checkExpiration = function() {
  if (this.isExpired && this.status !== 'filled' && this.status !== 'expired') {
    this.status = 'expired';
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Prescription', prescriptionSchema);