const express = require('express');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Analysis = require('../models/Analysis');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Doctor only)
router.get('/stats', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get basic counts
    const [
      totalPatients,
      todayAppointments,
      highRiskPatients,
      thisMonthConsultations,
      pendingAnalyses,
      activePrescriptions
    ] = await Promise.all([
      Patient.countDocuments({ doctorId, isActive: true }),
      Appointment.countDocuments({ 
        doctorId, 
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'scheduled'
      }),
      Patient.countDocuments({ doctorId, riskScore: { $gt: 70 }, isActive: true }),
      Appointment.countDocuments({ 
        doctorId, 
        createdAt: { $gte: startOfMonth },
        status: 'completed'
      }),
      Analysis.countDocuments({ doctorId, status: 'pending' }),
      Prescription.countDocuments({ 
        doctorId, 
        status: { $in: ['pending', 'sent'] }
      })
    ]);

    res.json({
      totalPatients,
      todayAppointments,
      highRiskPatients,
      thisMonthConsultations,
      pendingAnalyses,
      activePrescriptions
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
});

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent activity for dashboard
// @access  Private (Doctor only)
router.get('/recent-activity', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const doctorId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent appointments
    const recentAppointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get recent analyses
    const recentAnalyses = await Analysis.find({ doctorId })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get recent prescriptions
    const recentPrescriptions = await Prescription.find({ doctorId })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Combine and sort all activities
    const activities = [
      ...recentAppointments.map(apt => ({
        type: 'appointment',
        id: apt._id,
        patientName: apt.patientId.name,
        description: `Appointment scheduled for ${apt.date.toDateString()} at ${apt.time}`,
        timestamp: apt.createdAt,
        status: apt.status
      })),
      ...recentAnalyses.map(analysis => ({
        type: 'analysis',
        id: analysis._id,
        patientName: analysis.patientId.name,
        description: `${analysis.type} analysis uploaded`,
        timestamp: analysis.createdAt,
        status: analysis.status
      })),
      ...recentPrescriptions.map(prescription => ({
        type: 'prescription',
        id: prescription._id,
        patientName: prescription.patientId.name,
        description: `Prescription created with ${prescription.medications.length} medication(s)`,
        timestamp: prescription.createdAt,
        status: prescription.status
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

    res.json(activities);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Server error while fetching recent activity' });
  }
});

// @route   GET /api/dashboard/upcoming-appointments
// @desc    Get upcoming appointments for dashboard
// @access  Private (Doctor only)
router.get('/upcoming-appointments', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const doctorId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    const now = new Date();

    const upcomingAppointments = await Appointment.find({
      doctorId,
      date: { $gte: now },
      status: 'scheduled'
    })
    .populate('patientId', 'name email phone riskScore')
    .sort({ date: 1, time: 1 })
    .limit(limit);

    res.json(upcomingAppointments);
  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({ message: 'Server error while fetching upcoming appointments' });
  }
});

// @route   GET /api/dashboard/alerts
// @desc    Get alerts and notifications for dashboard
// @access  Private (Doctor only)
router.get('/alerts', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const doctorId = req.user._id;
    const alerts = [];

    // High risk patients
    const highRiskPatients = await Patient.find({
      doctorId,
      riskScore: { $gt: 80 },
      isActive: true
    }).limit(5);

    highRiskPatients.forEach(patient => {
      alerts.push({
        type: 'high-risk',
        severity: 'high',
        message: `${patient.name} has a high risk score of ${patient.riskScore}%`,
        patientId: patient._id,
        timestamp: patient.updatedAt
      });
    });

    // Overdue appointments
    const overdueAppointments = await Appointment.find({
      doctorId,
      date: { $lt: new Date() },
      status: 'scheduled'
    }).populate('patientId', 'name').limit(5);

    overdueAppointments.forEach(appointment => {
      alerts.push({
        type: 'overdue-appointment',
        severity: 'medium',
        message: `Overdue appointment with ${appointment.patientId.name}`,
        appointmentId: appointment._id,
        timestamp: appointment.date
      });
    });

    // Expired prescriptions
    const expiredPrescriptions = await Prescription.find({
      doctorId,
      validUntil: { $lt: new Date() },
      status: { $ne: 'expired' }
    }).populate('patientId', 'name').limit(5);

    expiredPrescriptions.forEach(prescription => {
      alerts.push({
        type: 'expired-prescription',
        severity: 'low',
        message: `Prescription for ${prescription.patientId.name} has expired`,
        prescriptionId: prescription._id,
        timestamp: prescription.validUntil
      });
    });

    // Pending analyses
    const pendingAnalyses = await Analysis.find({
      doctorId,
      status: 'pending',
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
    }).populate('patientId', 'name').limit(5);

    pendingAnalyses.forEach(analysis => {
      alerts.push({
        type: 'pending-analysis',
        severity: 'medium',
        message: `Analysis for ${analysis.patientId.name} is still pending`,
        analysisId: analysis._id,
        timestamp: analysis.createdAt
      });
    });

    // Sort alerts by severity and timestamp
    const severityOrder = { high: 3, medium: 2, low: 1 };
    alerts.sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.json(alerts.slice(0, 10)); // Return top 10 alerts
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error while fetching alerts' });
  }
});

// @route   GET /api/dashboard/charts/vitals
// @desc    Get vitals data for charts
// @access  Private (Doctor only)
router.get('/charts/vitals', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId, days = 7 } = req.query;

    let query = { doctorId, isActive: true };
    if (patientId) {
      query._id = patientId;
    }

    // Get patients with recent vital updates
    const patients = await Patient.find(query)
      .sort({ 'vitals.lastUpdated': -1 })
      .limit(10);

    // Generate mock time series data for demonstration
    const vitalsData = [];
    const now = new Date();
    
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Calculate average vitals for the day (mock data)
      const avgBloodPressure = patients.length > 0 
        ? patients.reduce((sum, p) => {
            const [systolic] = p.vitals.bloodPressure.split('/').map(Number);
            return sum + (systolic || 120);
          }, 0) / patients.length
        : 120;
      
      const avgHeartRate = patients.length > 0
        ? patients.reduce((sum, p) => sum + (p.vitals.heartRate || 72), 0) / patients.length
        : 72;

      vitalsData.push({
        date: date.toISOString().split('T')[0],
        bloodPressure: Math.round(avgBloodPressure + (Math.random() - 0.5) * 10),
        heartRate: Math.round(avgHeartRate + (Math.random() - 0.5) * 10),
        temperature: 98.6 + (Math.random() - 0.5) * 2,
        oxygenSaturation: 98 + Math.round((Math.random() - 0.5) * 4)
      });
    }

    res.json(vitalsData);
  } catch (error) {
    console.error('Get vitals chart data error:', error);
    res.status(500).json({ message: 'Server error while fetching vitals chart data' });
  }
});

// @route   GET /api/dashboard/charts/appointments
// @desc    Get appointments data for charts
// @access  Private (Doctor only)
router.get('/charts/appointments', auth, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { days = 7 } = req.query;

    const appointmentsData = [];
    const now = new Date();
    
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const dayAppointments = await Appointment.countDocuments({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      appointmentsData.push({
        date: startOfDay.toISOString().split('T')[0],
        day: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayAppointments
      });
    }

    res.json(appointmentsData);
  } catch (error) {
    console.error('Get appointments chart data error:', error);
    res.status(500).json({ message: 'Server error while fetching appointments chart data' });
  }
});

module.exports = router;