const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Analysis = require('../models/Analysis');
const Patient = require('../models/Patient');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/analysis';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `analysis-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/dicom',
    'image/dicom'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG, and DICOM files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   GET /api/analysis
// @desc    Get analyses for the authenticated doctor
// @access  Private (Doctor only)
router.get('/', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type,
      patientId,
      search 
    } = req.query;
    
    const query = { doctorId: req.user._id };
    
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

    let analyses = await Analysis.find(query)
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Search functionality (after population)
    if (search) {
      analyses = analyses.filter(analysis => 
        analysis.patientId.name.toLowerCase().includes(search.toLowerCase()) ||
        analysis.type.toLowerCase().includes(search.toLowerCase()) ||
        analysis.fileName.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Analysis.countDocuments(query);

    res.json({
      analyses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ message: 'Server error while fetching analyses' });
  }
});

// @route   GET /api/analysis/:id
// @desc    Get analysis by ID
// @access  Private (Doctor only)
router.get('/:id', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    }).populate('patientId', 'name email phone age conditions allergies');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ message: 'Server error while fetching analysis' });
  }
});

// @route   POST /api/analysis/upload
// @desc    Upload and create new analysis
// @access  Private (Doctor only)
router.post('/upload', auth, authorize('doctor', 'admin'), upload.single('analysisFile'), [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('type').isIn([
    'Analyse de sang',
    'Radiographie',
    'ECG',
    'IRM',
    'Scanner',
    'Échographie',
    'Analyse d\'urine',
    'Biopsie',
    'Autre'
  ]).withMessage('Valid analysis type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Analysis file is required' });
    }

    const { patientId, type } = req.body;

    // Verify patient belongs to this doctor
    const patient = await Patient.findOne({
      _id: patientId,
      doctorId: req.user._id,
      isActive: true
    });

    if (!patient) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Patient not found' });
    }

    const analysis = new Analysis({
      doctorId: req.user._id,
      patientId,
      type,
      fileName: req.file.originalname,
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
      filePath: req.file.path
    });

    await analysis.save();

    // Start AI processing simulation in background
    setTimeout(async () => {
      try {
        await analysis.simulateAIProcessing();
      } catch (error) {
        console.error('AI processing simulation error:', error);
      }
    }, 3000);

    const populatedAnalysis = await Analysis.findById(analysis._id)
      .populate('patientId', 'name email phone');

    res.status(201).json({
      message: 'Analysis uploaded successfully',
      analysis: populatedAnalysis
    });
  } catch (error) {
    console.error('Upload analysis error:', error);
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error while uploading analysis' });
  }
});

// @route   PUT /api/analysis/:id/process
// @desc    Manually trigger AI processing
// @access  Private (Doctor only)
router.put('/:id/process', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    if (analysis.status !== 'pending') {
      return res.status(400).json({ message: 'Analysis is not in pending status' });
    }

    // Simulate AI processing
    await analysis.simulateAIProcessing();

    const populatedAnalysis = await Analysis.findById(analysis._id)
      .populate('patientId', 'name email phone');

    res.json({
      message: 'Analysis processed successfully',
      analysis: populatedAnalysis
    });
  } catch (error) {
    console.error('Process analysis error:', error);
    res.status(500).json({ message: 'Server error while processing analysis' });
  }
});

// @route   PUT /api/analysis/:id/review
// @desc    Review and validate analysis
// @access  Private (Doctor only)
router.put('/:id/review', auth, authorize('doctor', 'admin'), [
  body('reviewNotes').optional().trim(),
  body('status').isIn(['reviewed', 'archived']).withMessage('Valid status required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { reviewNotes, status } = req.body;

    const analysis = await Analysis.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    if (analysis.status !== 'processed') {
      return res.status(400).json({ message: 'Analysis must be processed before review' });
    }

    analysis.status = status;
    analysis.reviewedBy = req.user._id;
    analysis.reviewedAt = new Date();
    analysis.reviewNotes = reviewNotes;

    // Add review log
    analysis.aiProcessingLog.push({
      action: 'reviewed',
      details: `Analysis reviewed by ${req.user.name}`,
      confidence: 1.0
    });

    await analysis.save();

    const populatedAnalysis = await Analysis.findById(analysis._id)
      .populate('patientId', 'name email phone')
      .populate('reviewedBy', 'name');

    res.json({
      message: 'Analysis reviewed successfully',
      analysis: populatedAnalysis
    });
  } catch (error) {
    console.error('Review analysis error:', error);
    res.status(500).json({ message: 'Server error while reviewing analysis' });
  }
});

// @route   PUT /api/analysis/:id
// @desc    Update analysis
// @access  Private (Doctor only)
router.put('/:id', auth, authorize('doctor', 'admin'), [
  body('type').optional().isIn([
    'Analyse de sang',
    'Radiographie',
    'ECG',
    'IRM',
    'Scanner',
    'Échographie',
    'Analyse d\'urine',
    'Biopsie',
    'Autre'
  ]),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const analysis = await Analysis.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['type', 'priority', 'tags'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        analysis[field] = req.body[field];
      }
    });

    await analysis.save();

    const populatedAnalysis = await Analysis.findById(analysis._id)
      .populate('patientId', 'name email phone');

    res.json({
      message: 'Analysis updated successfully',
      analysis: populatedAnalysis
    });
  } catch (error) {
    console.error('Update analysis error:', error);
    res.status(500).json({ message: 'Server error while updating analysis' });
  }
});

// @route   DELETE /api/analysis/:id
// @desc    Delete analysis
// @access  Private (Doctor only)
router.delete('/:id', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Delete the file from filesystem
    if (fs.existsSync(analysis.filePath)) {
      fs.unlinkSync(analysis.filePath);
    }

    await Analysis.findByIdAndDelete(req.params.id);

    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ message: 'Server error while deleting analysis' });
  }
});

// @route   GET /api/analysis/stats/overview
// @desc    Get analysis statistics
// @access  Private (Doctor only)
router.get('/stats/overview', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const doctorId = req.user._id;

    const stats = await Analysis.aggregate([
      { $match: { doctorId } },
      {
        $facet: {
          totalAnalyses: [
            { $count: "count" }
          ],
          analysesByStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          analysesByType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          thisMonthAnalyses: [
            { 
              $match: { 
                createdAt: { 
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
                } 
              } 
            },
            { $count: "count" }
          ]
        }
      }
    ]);

    const result = {
      totalAnalyses: stats[0].totalAnalyses[0]?.count || 0,
      thisMonthAnalyses: stats[0].thisMonthAnalyses[0]?.count || 0,
      analysesByStatus: stats[0].analysesByStatus,
      analysesByType: stats[0].analysesByType
    };

    res.json(result);
  } catch (error) {
    console.error('Get analysis stats error:', error);
    res.status(500).json({ message: 'Server error while fetching analysis statistics' });
  }
});

// @route   GET /api/analysis/:id/download
// @desc    Download analysis file
// @access  Private (Doctor only)
router.get('/:id/download', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      doctorId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    if (!fs.existsSync(analysis.filePath)) {
      return res.status(404).json({ message: 'Analysis file not found' });
    }

    res.download(analysis.filePath, analysis.fileName);
  } catch (error) {
    console.error('Download analysis error:', error);
    res.status(500).json({ message: 'Server error while downloading analysis' });
  }
});

module.exports = router;