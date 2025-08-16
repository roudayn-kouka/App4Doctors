const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: [true, 'Analysis type is required'],
    enum: [
      'Analyse de sang',
      'Radiographie',
      'ECG',
      'IRM',
      'Scanner',
      'Échographie',
      'Analyse d\'urine',
      'Biopsie',
      'Autre'
    ]
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  fileSize: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'reviewed', 'archived'],
    default: 'pending'
  },
  results: {
    summary: {
      type: String,
      trim: true
    },
    keyFindings: [{
      type: String,
      trim: true
    }],
    recommendations: [{
      type: String,
      trim: true
    }],
    abnormalValues: [{
      parameter: {
        type: String,
        required: true,
        trim: true
      },
      value: {
        type: String,
        required: true,
        trim: true
      },
      normal: {
        type: String,
        required: true,
        trim: true
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      }
    }],
    extractedData: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  aiProcessingLog: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      required: true
    },
    details: {
      type: String
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Index for efficient queries
analysisSchema.index({ doctorId: 1, createdAt: -1 });
analysisSchema.index({ patientId: 1, createdAt: -1 });
analysisSchema.index({ status: 1 });

// Virtual for processing time
analysisSchema.virtual('processingTime').get(function() {
  if (this.status === 'pending') return null;
  
  const processedLog = this.aiProcessingLog.find(log => log.action === 'processed');
  if (!processedLog) return null;
  
  return processedLog.timestamp - this.createdAt;
});

// Method to simulate AI processing
analysisSchema.methods.simulateAIProcessing = async function() {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Add processing log
  this.aiProcessingLog.push({
    action: 'processed',
    details: 'AI analysis completed',
    confidence: 0.85 + Math.random() * 0.15
  });
  
  // Generate mock results based on analysis type
  this.results = this.generateMockResults();
  this.status = 'processed';
  
  return this.save();
};

// Generate mock results based on analysis type
analysisSchema.methods.generateMockResults = function() {
  const mockResults = {
    'Analyse de sang': {
      summary: 'Analyse sanguine complète montrant des valeurs globalement normales avec quelques points d\'attention.',
      keyFindings: [
        'Numération formule sanguine dans les normes',
        'Fonction hépatique normale',
        'Glycémie légèrement élevée',
        'Profil lipidique acceptable'
      ],
      recommendations: [
        'Surveiller la glycémie',
        'Maintenir une alimentation équilibrée',
        'Contrôle dans 3 mois'
      ],
      abnormalValues: [
        {
          parameter: 'Glycémie',
          value: '1.15 g/L',
          normal: '0.70-1.10 g/L',
          severity: 'low'
        }
      ]
    },
    'ECG': {
      summary: 'Électrocardiogramme montrant un rythme sinusal normal avec quelques variations mineures.',
      keyFindings: [
        'Rythme sinusal régulier',
        'Fréquence cardiaque normale',
        'Pas d\'anomalie majeure détectée'
      ],
      recommendations: [
        'Surveillance cardiaque de routine',
        'Maintenir l\'activité physique'
      ],
      abnormalValues: []
    }
  };
  
  return mockResults[this.type] || {
    summary: 'Analyse automatique terminée. Résultats extraits et structurés.',
    keyFindings: ['Paramètres principaux identifiés'],
    recommendations: ['Consultation de suivi recommandée'],
    abnormalValues: []
  };
};

module.exports = mongoose.model('Analysis', analysisSchema);