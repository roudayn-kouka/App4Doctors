const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/appointments
// @desc    Get appointments for the authenticated doctor
// @access  Private (Doctor only)
router.get('/', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      date, 
      status, 
      type, 
      patientId 
    } = req.query;
    
    const query = { doctorId: req.user._id };
    
    // Date filter
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Type filter
    if (type) {
      query.type = type;
    }
    
    // Patient filter
    if (patientId) {
      query.patientId = patientId;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone age')
      .sort({ date: 1, time: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private (Doctor only)
router.get('/:id', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    }).populate('patientId', 'name email phone age conditions allergies');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error while fetching appointment' });
  }
});

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private (Doctor only)
router.post('/', auth, authorize('doctor', 'admin'), [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('type').isIn(['consultation', 'follow-up', 'telemedicine']).withMessage('Valid appointment type required'),
  body('duration').optional().isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { patientId, date, time, type, duration, notes, meetLink } = req.body;

    // Verify patient belongs to this doctor
    const patient = await Patient.findOne({
      _id: patientId,
      doctorId: req.user._id,
      isActive: true
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check for scheduling conflicts
    const appointmentDate = new Date(date);
    const existingAppointment = await Appointment.findOne({
      doctorId: req.user._id,
      date: appointmentDate,
      time: time,
      status: { $in: ['scheduled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    const appointment = new Appointment({
      doctorId: req.user._id,
      patientId,
      date: appointmentDate,
      time,
      type,
      duration: duration || 30,
      notes,
      meetLink: type === 'telemedicine' ? meetLink : undefined
    });

    await appointment.save();

    // Update patient's next appointment
    patient.nextAppointment = appointmentDate;
    await patient.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone');

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error while creating appointment' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private (Doctor only)
router.put('/:id', auth, authorize('doctor', 'admin'), [
  body('date').optional().isISO8601(),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('type').optional().isIn(['consultation', 'follow-up', 'telemedicine']),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'no-show']),
  body('duration').optional().isInt({ min: 15, max: 180 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check for scheduling conflicts if date/time is being changed
    if (req.body.date || req.body.time) {
      const newDate = req.body.date ? new Date(req.body.date) : appointment.date;
      const newTime = req.body.time || appointment.time;

      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctorId: req.user._id,
        date: newDate,
        time: newTime,
        status: { $in: ['scheduled'] }
      });

      if (conflictingAppointment) {
        return res.status(400).json({ message: 'Time slot already booked' });
      }
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        appointment[key] = req.body[key];
      }
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone');

    res.json({
      message: 'Appointment updated successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error while updating appointment' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private (Doctor only)
router.delete('/:id', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error while deleting appointment' });
  }
});

// @route   GET /api/appointments/stats/overview
// @desc    Get appointments statistics
// @access  Private (Doctor only)
router.get('/stats/overview', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const stats = await Appointment.aggregate([
      { $match: { doctorId } },
      {
        $facet: {
          todayAppointments: [
            { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
            { $count: "count" }
          ],
          totalAppointments: [
            { $count: "count" }
          ],
          appointmentsByStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          appointmentsByType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          upcomingAppointments: [
            { $match: { date: { $gte: new Date() }, status: 'scheduled' } },
            { $count: "count" }
          ]
        }
      }
    ]);

    const result = {
      todayAppointments: stats[0].todayAppointments[0]?.count || 0,
      totalAppointments: stats[0].totalAppointments[0]?.count || 0,
      upcomingAppointments: stats[0].upcomingAppointments[0]?.count || 0,
      appointmentsByStatus: stats[0].appointmentsByStatus,
      appointmentsByType: stats[0].appointmentsByType
    };

    res.json(result);
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ message: 'Server error while fetching appointment statistics' });
  }
});

// @route   GET /api/appointments/calendar/:year/:month
// @desc    Get appointments for calendar view
// @access  Private (Doctor only)
router.get('/calendar/:year/:month', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const appointments = await Appointment.find({
      doctorId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    })
    .populate('patientId', 'name')
    .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get calendar appointments error:', error);
    res.status(500).json({ message: 'Server error while fetching calendar appointments' });
  }
});

module.exports = router;