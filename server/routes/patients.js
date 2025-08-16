const express = require('express');
const Patient = require('../models/Patient');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/patients
// @desc    Get all patients for the authenticated doctor
// @access  Private (Doctor only)
router.get('/', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, riskLevel } = req.query;
    
    const query = { doctorId: req.user._id, isActive: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Risk level filter
    if (riskLevel) {
      switch (riskLevel) {
        case 'high':
          query.riskScore = { $gt: 70 };
          break;
        case 'medium':
          query.riskScore = { $gte: 40, $lte: 70 };
          break;
        case 'low':
          query.riskScore = { $lt: 40 };
          break;
      }
    }

    const patients = await Patient.find(query)
      .sort({ lastVisit: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Patient.countDocuments(query);

    res.json({
      patients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error while fetching patients' });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private (Doctor only)
router.get('/:id', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
      isActive: true
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Server error while fetching patient' });
  }
});

// @route   POST /api/patients
// @desc    Create a new patient
// @access  Private (Doctor only)
router.post('/', auth, authorize('doctor', 'admin'), [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if patient with same email already exists for this doctor
    const existingPatient = await Patient.findOne({
      email: req.body.email,
      doctorId: req.user._id,
      isActive: true
    });

    if (existingPatient) {
      return res.status(400).json({ message: 'Patient with this email already exists' });
    }

    const patient = new Patient({
      ...req.body,
      doctorId: req.user._id
    });

    // Calculate initial risk score
    patient.calculateRiskScore();

    await patient.save();

    res.status(201).json({
      message: 'Patient created successfully',
      patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Server error while creating patient' });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private (Doctor only)
router.put('/:id', auth, authorize('doctor', 'admin'), [
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ min: 10 }),
  body('age').optional().isInt({ min: 0, max: 150 }),
  body('gender').optional().isIn(['male', 'female', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const patient = await Patient.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
      isActive: true
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        patient[key] = req.body[key];
      }
    });

    // Recalculate risk score if relevant fields changed
    if (req.body.age || req.body.conditions || req.body.vitals) {
      patient.calculateRiskScore();
    }

    await patient.save();

    res.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Server error while updating patient' });
  }
});

// @route   PUT /api/patients/:id/vitals
// @desc    Update patient vitals
// @access  Private (Doctor only)
router.put('/:id/vitals', auth, authorize('doctor', 'admin'), [
  body('bloodPressure').optional().matches(/^\d{2,3}\/\d{2,3}$/).withMessage('Blood pressure format should be XXX/XX'),
  body('heartRate').optional().isInt({ min: 30, max: 200 }).withMessage('Heart rate must be between 30 and 200'),
  body('temperature').optional().isFloat({ min: 90, max: 110 }).withMessage('Temperature must be between 90 and 110'),
  body('oxygenSaturation').optional().isInt({ min: 70, max: 100 }).withMessage('Oxygen saturation must be between 70 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const patient = await Patient.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
      isActive: true
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update vitals and recalculate risk score
    patient.updateVitals(req.body);
    await patient.save();

    res.json({
      message: 'Patient vitals updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update vitals error:', error);
    res.status(500).json({ message: 'Server error while updating vitals' });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Soft delete patient (set isActive to false)
// @access  Private (Doctor only)
router.delete('/:id', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
      isActive: true
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.isActive = false;
    await patient.save();

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Server error while deleting patient' });
  }
});

// @route   GET /api/patients/stats/overview
// @desc    Get patients statistics overview
// @access  Private (Doctor only)
router.get('/stats/overview', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    const stats = await Patient.aggregate([
      { $match: { doctorId, isActive: true } },
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          averageAge: { $avg: '$age' },
          averageRiskScore: { $avg: '$riskScore' },
          highRiskPatients: {
            $sum: { $cond: [{ $gt: ['$riskScore', 70] }, 1, 0] }
          },
          mediumRiskPatients: {
            $sum: { $cond: [{ $and: [{ $gte: ['$riskScore', 40] }, { $lte: ['$riskScore', 70] }] }, 1, 0] }
          },
          lowRiskPatients: {
            $sum: { $cond: [{ $lt: ['$riskScore', 40] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalPatients: 0,
      averageAge: 0,
      averageRiskScore: 0,
      highRiskPatients: 0,
      mediumRiskPatients: 0,
      lowRiskPatients: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({ message: 'Server error while fetching patient statistics' });
  }
});

module.exports = router;