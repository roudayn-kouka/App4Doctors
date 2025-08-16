const express = require('express');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/prescriptions
// @desc    Get prescriptions for the authenticated doctor
// @access  Private (Doctor only)
router.get('/', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      patientId,
      search 
    } = req.query;
    
    const query = { doctorId: req.user._id };
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Patient filter
    if (patientId) {
      query.patientId = patientId;
    }

    let prescriptions = await Prescription.find(query)
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Search functionality (after population)
    if (search) {
      prescriptions = prescriptions.filter(prescription => 
        prescription.patientId.name.toLowerCase().includes(search.toLowerCase()) ||
        prescription.medications.some(med => 
          med.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Check and update expired prescriptions
    for (let prescription of prescriptions) {
      await prescription.checkExpiration();
    }

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ message: 'Server error while fetching prescriptions' });
  }
});

// @route   GET /api/prescriptions/:id
// @desc    Get prescription by ID
// @access  Private (Doctor only)
router.get('/:id', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    }).populate('patientId', 'name email phone age conditions allergies');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check expiration
    await prescription.checkExpiration();

    res.json(prescription);
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ message: 'Server error while fetching prescription' });
  }
});

// @route   POST /api/prescriptions
// @desc    Create a new prescription
// @access  Private (Doctor only)
router.post('/', auth, authorize('doctor', 'admin'), [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('medications').isArray({ min: 1 }).withMessage('At least one medication is required'),
  body('medications.*.name').trim().isLength({ min: 1 }).withMessage('Medication name is required'),
  body('medications.*.dosage').trim().isLength({ min: 1 }).withMessage('Dosage is required'),
  body('medications.*.frequency').trim().isLength({ min: 1 }).withMessage('Frequency is required'),
  body('medications.*.duration').trim().isLength({ min: 1 }).withMessage('Duration is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { patientId, medications, pharmacy, notes } = req.body;

    // Verify patient belongs to this doctor
    const patient = await Patient.findOne({
      _id: patientId,
      doctorId: req.user._id,
      isActive: true
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescription = new Prescription({
      doctorId: req.user._id,
      patientId,
      medications,
      pharmacy,
      notes
    });

    await prescription.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patientId', 'name email phone');

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: populatedPrescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Server error while creating prescription' });
  }
});

// @route   PUT /api/prescriptions/:id
// @desc    Update prescription
// @access  Private (Doctor only)
router.put('/:id', auth, authorize('doctor', 'admin'), [
  body('medications').optional().isArray({ min: 1 }),
  body('medications.*.name').optional().trim().isLength({ min: 1 }),
  body('medications.*.dosage').optional().trim().isLength({ min: 1 }),
  body('medications.*.frequency').optional().trim().isLength({ min: 1 }),
  body('medications.*.duration').optional().trim().isLength({ min: 1 }),
  body('status').optional().isIn(['pending', 'sent', 'filled', 'expired'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        prescription[key] = req.body[key];
      }
    });

    // Set filled date if status changed to filled
    if (req.body.status === 'filled' && prescription.status !== 'filled') {
      prescription.filledDate = new Date();
    }

    await prescription.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patientId', 'name email phone');

    res.json({
      message: 'Prescription updated successfully',
      prescription: populatedPrescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ message: 'Server error while updating prescription' });
  }
});

// @route   PUT /api/prescriptions/:id/status
// @desc    Update prescription status
// @access  Private (Doctor only)
router.put('/:id/status', auth, authorize('doctor', 'admin'), [
  body('status').isIn(['pending', 'sent', 'filled', 'expired']).withMessage('Valid status required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status } = req.body;
    
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.status = status;
    
    // Set filled date if status changed to filled
    if (status === 'filled' && prescription.status !== 'filled') {
      prescription.filledDate = new Date();
    }

    await prescription.save();

    res.json({
      message: 'Prescription status updated successfully',
      prescription
    });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({ message: 'Server error while updating prescription status' });
  }
});

// @route   DELETE /api/prescriptions/:id
// @desc    Delete prescription
// @access  Private (Doctor only)
router.delete('/:id', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Only allow deletion of pending prescriptions
    if (prescription.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending prescriptions can be deleted' 
      });
    }

    await Prescription.findByIdAndDelete(req.params.id);

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ message: 'Server error while deleting prescription' });
  }
});

// @route   GET /api/prescriptions/stats/overview
// @desc    Get prescriptions statistics
// @access  Private (Doctor only)
router.get('/stats/overview', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const doctorId = req.user._id;

    const stats = await Prescription.aggregate([
      { $match: { doctorId } },
      {
        $facet: {
          totalPrescriptions: [
            { $count: "count" }
          ],
          prescriptionsByStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          thisMonthPrescriptions: [
            { 
              $match: { 
                createdAt: { 
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
                } 
              } 
            },
            { $count: "count" }
          ],
          expiredPrescriptions: [
            { $match: { status: 'expired' } },
            { $count: "count" }
          ]
        }
      }
    ]);

    const result = {
      totalPrescriptions: stats[0].totalPrescriptions[0]?.count || 0,
      thisMonthPrescriptions: stats[0].thisMonthPrescriptions[0]?.count || 0,
      expiredPrescriptions: stats[0].expiredPrescriptions[0]?.count || 0,
      prescriptionsByStatus: stats[0].prescriptionsByStatus
    };

    res.json(result);
  } catch (error) {
    console.error('Get prescription stats error:', error);
    res.status(500).json({ message: 'Server error while fetching prescription statistics' });
  }
});

// @route   GET /api/prescriptions/:id/download
// @desc    Generate prescription PDF/text for download
// @access  Private (Doctor only)
router.get('/:id/download', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    })
    .populate('patientId', 'name email phone age')
    .populate('doctorId', 'name specialty licenseNumber');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Generate prescription content
    const prescriptionContent = `
ORDONNANCE MÉDICALE

═══════════════════════════════════════════════════════════════

Patient: ${prescription.patientId.name}
Email: ${prescription.patientId.email}
Téléphone: ${prescription.patientId.phone}
Âge: ${prescription.patientId.age} ans

Date: ${prescription.createdAt.toLocaleDateString('fr-FR')}
Numéro d'ordonnance: ${prescription.prescriptionNumber}
Pharmacie: ${prescription.pharmacy || 'Non spécifiée'}

═══════════════════════════════════════════════════════════════

MÉDICAMENTS PRESCRITS:

${prescription.medications.map((med, index) => 
  `${index + 1}. ${med.name}
     Dosage: ${med.dosage}
     Fréquence: ${med.frequency}
     Durée du traitement: ${med.duration}
     ${med.instructions ? `Instructions: ${med.instructions}` : ''}
     
`).join('')}

═══════════════════════════════════════════════════════════════

INSTRUCTIONS PARTICULIÈRES:
${prescription.notes || 'Aucune instruction particulière'}

═══════════════════════════════════════════════════════════════

Dr. ${prescription.doctorId.name}
${prescription.doctorId.specialty}
Licence: ${prescription.doctorId.licenseNumber}
Signature électronique: ${new Date().toISOString()}

Valide jusqu'au: ${prescription.validUntil.toLocaleDateString('fr-FR')}

═══════════════════════════════════════════════════════════════

Cette ordonnance a été générée électroniquement par App4Doctor
Développé par Pixemantic - Plateforme médicale sécurisée
    `;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Ordonnance_${prescription.patientId.name.replace(/\s+/g, '_')}_${prescription.prescriptionNumber}.txt"`);
    
    res.send(prescriptionContent);
  } catch (error) {
    console.error('Download prescription error:', error);
    res.status(500).json({ message: 'Server error while generating prescription download' });
  }
});

module.exports = router;