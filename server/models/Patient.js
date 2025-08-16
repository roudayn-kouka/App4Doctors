const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age must be positive'],
    max: [150, 'Age must be realistic']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    trim: true
  },
  allergies: [{
    type: String,
    trim: true
  }],
  conditions: [{
    type: String,
    trim: true
  }],
  vitals: {
    bloodPressure: {
      type: String,
      default: '120/80'
    },
    heartRate: {
      type: Number,
      default: 72,
      min: [30, 'Heart rate too low'],
      max: [200, 'Heart rate too high']
    },
    temperature: {
      type: Number,
      default: 98.6,
      min: [90, 'Temperature too low'],
      max: [110, 'Temperature too high']
    },
    oxygenSaturation: {
      type: Number,
      default: 98,
      min: [70, 'Oxygen saturation too low'],
      max: [100, 'Oxygen saturation cannot exceed 100']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  riskScore: {
    type: Number,
    default: 0,
    min: [0, 'Risk score cannot be negative'],
    max: [100, 'Risk score cannot exceed 100']
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  nextAppointment: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate risk score based on conditions and vitals
patientSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Age factor
  if (this.age > 65) score += 20;
  else if (this.age > 50) score += 10;
  
  // Conditions factor
  const highRiskConditions = ['diabetes', 'hypertension', 'heart disease', 'cancer'];
  this.conditions.forEach(condition => {
    if (highRiskConditions.some(risk => condition.toLowerCase().includes(risk))) {
      score += 15;
    }
  });
  
  // Vitals factor
  const [systolic, diastolic] = this.vitals.bloodPressure.split('/').map(Number);
  if (systolic > 140 || diastolic > 90) score += 15;
  if (this.vitals.heartRate > 100 || this.vitals.heartRate < 60) score += 10;
  if (this.vitals.oxygenSaturation < 95) score += 20;
  
  this.riskScore = Math.min(score, 100);
  return this.riskScore;
};

// Update vitals and recalculate risk score
patientSchema.methods.updateVitals = function(newVitals) {
  this.vitals = { ...this.vitals, ...newVitals, lastUpdated: new Date() };
  this.calculateRiskScore();
};

module.exports = mongoose.model('Patient', patientSchema);