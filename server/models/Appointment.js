const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'telemedicine'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  duration: {
    type: Number,
    default: 30,
    min: [15, 'Appointment duration must be at least 15 minutes'],
    max: [180, 'Appointment duration cannot exceed 3 hours']
  },
  notes: {
    type: String,
    trim: true
  },
  meetLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid URL for the meeting link'
    }
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  diagnosis: {
    type: String,
    trim: true
  },
  treatment: {
    type: String,
    trim: true
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });

// Virtual for formatted date and time
appointmentSchema.virtual('formattedDateTime').get(function() {
  return `${this.date.toDateString()} at ${this.time}`;
});

// Check if appointment is in the past
appointmentSchema.virtual('isPast').get(function() {
  const appointmentDateTime = new Date(this.date);
  const [hours, minutes] = this.time.split(':').map(Number);
  appointmentDateTime.setHours(hours, minutes);
  return appointmentDateTime < new Date();
});

module.exports = mongoose.model('Appointment', appointmentSchema);