const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { io } = require('../index');

// @route   POST /api/emergency/create
// @desc    Create a new emergency alert
// @access  Private
router.post('/create', [
  auth,
  [
    body('type', 'Emergency type is required').notEmpty(),
    body('severity', 'Severity level is required').isIn(['low', 'medium', 'high', 'critical']),
    body('priority', 'Priority level is required').isIn(['routine', 'urgent', 'emergency', 'immediate']),
    body('description', 'Emergency description is required').notEmpty(),
    body('location.coordinates.latitude', 'Latitude is required').isFloat(),
    body('location.coordinates.longitude', 'Longitude is required').isFloat()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const {
      type,
      severity,
      priority,
      symptoms,
      description,
      additionalNotes,
      location,
      vitalSigns
    } = req.body;

    // Create emergency object
    const emergencyData = {
      type,
      severity,
      priority,
      symptoms: symptoms || [],
      description,
      additionalNotes,
      location: {
        ...location,
        timestamp: new Date()
      },
      vitalSigns: vitalSigns || {},
      patientId: req.user.id,
      patientName: user.fullName,
      patientAge: user.age,
      patientPhone: user.phone,
      patientBloodGroup: user.bloodGroup,
      createdBy: req.user.id
    };

    const emergency = new Emergency(emergencyData);
    await emergency.save();

    // Add initial timeline event
    emergency.addTimelineEvent('created', 'Emergency alert created', req.user.id);
    await emergency.save();

    // Emit real-time alert
    io.emit('new-emergency', {
      emergencyId: emergency.emergencyId,
      type: emergency.type,
      severity: emergency.severity,
      priority: emergency.priority,
      location: emergency.location,
      patientName: emergency.patientName
    });

    // Notify emergency contacts
    if (user.emergencyContacts && user.emergencyContacts.length > 0) {
      for (const contact of user.emergencyContacts) {
        emergency.contactsNotified.push({
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
          notificationStatus: 'pending'
        });
      }
      await emergency.save();
    }

    res.status(201).json({
      success: true,
      emergency: emergency,
      message: 'Emergency alert created successfully'
    });

  } catch (error) {
    console.error('Emergency creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/emergency/active
// @desc    Get all active emergencies
// @access  Private
router.get('/active', auth, async (req, res) => {
  try {
    const activeEmergencies = await Emergency.find({
      status: { $in: ['pending', 'assigned', 'en-route', 'arrived', 'in-transit'] }
    })
    .populate('patientId', 'firstName lastName phone')
    .populate('assignedAmbulance.ambulanceId', 'firstName lastName phone')
    .populate('assignedHospital.hospitalId', 'institutionName')
    .sort({ createdAt: -1 });

    res.json(activeEmergencies);
  } catch (error) {
    console.error('Get active emergencies error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/emergency/:id
// @desc    Get emergency by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('patientId', 'firstName lastName phone bloodGroup allergies chronicConditions')
      .populate('assignedAmbulance.ambulanceId', 'firstName lastName phone')
      .populate('assignedHospital.hospitalId', 'institutionName address facilities')
      .populate('timeline.userId', 'firstName lastName userType');

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    res.json(emergency);
  } catch (error) {
    console.error('Get emergency error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/emergency/:id/update-status
// @desc    Update emergency status
// @access  Private
router.put('/:id/update-status', [
  auth,
  body('status', 'Status is required').isIn(['pending', 'assigned', 'en-route', 'arrived', 'in-transit', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    // Check if user has permission to update status
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow status updates by authorized users
    const canUpdateStatus = 
      user.userType === 'admin' ||
      user.userType === 'ambulance' ||
      user.userType === 'hospital' ||
      (user.userType === 'patient' && emergency.patientId.toString() === req.user.id);

    if (!canUpdateStatus) {
      return res.status(403).json({ error: 'Not authorized to update emergency status' });
    }

    const oldStatus = emergency.status;
    emergency.status = status;
    emergency.updatedBy = req.user.id;

    // Add timeline event
    emergency.addTimelineEvent(status, notes || `Status updated to ${status}`, req.user.id);

    // Handle status-specific logic
    if (status === 'completed') {
      emergency.completedAt = new Date();
      emergency.updateResponseTimes();
    } else if (status === 'cancelled') {
      emergency.cancelledAt = new Date();
    }

    await emergency.save();

    // Emit real-time update
    io.to(`emergency-${emergency.emergencyId}`).emit('emergency-status-updated', {
      emergencyId: emergency.emergencyId,
      status: emergency.status,
      updatedBy: user.fullName,
      timestamp: new Date()
    });

    res.json({
      success: true,
      emergency: emergency,
      message: `Emergency status updated from ${oldStatus} to ${status}`
    });

  } catch (error) {
    console.error('Update emergency status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/emergency/:id/assign-ambulance
// @desc    Assign ambulance to emergency
// @access  Private (Admin/Dispatcher)
router.put('/:id/assign-ambulance', [
  auth,
  body('ambulanceId', 'Ambulance ID is required').notEmpty(),
  body('estimatedArrival', 'Estimated arrival time is required').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ambulanceId, estimatedArrival, driverNotes } = req.body;
    
    // Check if user is authorized
    const user = await User.findById(req.user.id);
    if (!['admin', 'hospital'].includes(user.userType)) {
      return res.status(403).json({ error: 'Not authorized to assign ambulances' });
    }

    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    const ambulance = await User.findById(ambulanceId);
    if (!ambulance || ambulance.userType !== 'ambulance') {
      return res.status(404).json({ error: 'Ambulance not found' });
    }

    // Update emergency assignment
    emergency.assignedAmbulance = {
      ambulanceId: ambulanceId,
      driverName: ambulance.fullName,
      driverPhone: ambulance.phone,
      estimatedArrival: new Date(estimatedArrival)
    };

    emergency.status = 'assigned';
    emergency.addTimelineEvent('assigned', `Ambulance assigned: ${ambulance.fullName}`, req.user.id);
    emergency.updatedBy = req.user.id;

    await emergency.save();

    // Emit real-time update
    io.to(`emergency-${emergency.emergencyId}`).emit('ambulance-assigned', {
      emergencyId: emergency.emergencyId,
      ambulance: emergency.assignedAmbulance,
      assignedBy: user.fullName
    });

    res.json({
      success: true,
      emergency: emergency,
      message: 'Ambulance assigned successfully'
    });

  } catch (error) {
    console.error('Assign ambulance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/emergency/:id/update-location
// @desc    Update emergency location (for mobile users)
// @access  Private
router.put('/:id/update-location', [
  auth,
  body('coordinates.latitude', 'Latitude is required').isFloat(),
  body('coordinates.longitude', 'Longitude is required').isFloat()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { coordinates, accuracy } = req.body;
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    // Check if user is the patient or authorized
    if (emergency.patientId.toString() !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (!['admin', 'ambulance'].includes(user.userType)) {
        return res.status(403).json({ error: 'Not authorized to update location' });
      }
    }

    emergency.location.coordinates = coordinates;
    emergency.location.accuracy = accuracy;
    emergency.location.timestamp = new Date();
    emergency.updatedBy = req.user.id;

    await emergency.save();

    // Emit real-time location update
    io.to(`emergency-${emergency.emergencyId}`).emit('location-updated', {
      emergencyId: emergency.emergencyId,
      location: emergency.location
    });

    res.json({
      success: true,
      location: emergency.location,
      message: 'Location updated successfully'
    });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/emergency/:id/chat
// @desc    Send chat message in emergency
// @access  Private
router.post('/:id/chat', [
  auth,
  body('message', 'Message is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add chat message
    emergency.chatMessages.push({
      senderId: req.user.id,
      senderType: user.userType,
      message: message,
      timestamp: new Date()
    });

    await emergency.save();

    // Emit real-time chat message
    io.to(`emergency-${emergency.emergencyId}`).emit('new-chat-message', {
      emergencyId: emergency.emergencyId,
      message: {
        senderId: req.user.id,
        senderType: user.userType,
        senderName: user.fullName,
        message: message,
        timestamp: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Chat message sent successfully'
    });

  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/emergency/:id/chat
// @desc    Get emergency chat messages
// @access  Private
router.get('/:id/chat', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    res.json(emergency.chatMessages);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/emergency/user/:userId
// @desc    Get emergencies by user ID
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check if user is authorized to view other user's emergencies
    if (req.params.userId !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (!['admin', 'doctor', 'hospital'].includes(user.userType)) {
        return res.status(403).json({ error: 'Not authorized to view other user emergencies' });
      }
    }

    const emergencies = await Emergency.find({ patientId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('assignedAmbulance.ambulanceId', 'firstName lastName')
      .populate('assignedHospital.hospitalId', 'institutionName');

    res.json(emergencies);
  } catch (error) {
    console.error('Get user emergencies error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/emergency/:id
// @desc    Cancel emergency
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    // Check if user can cancel emergency
    if (emergency.patientId.toString() !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (!['admin'].includes(user.userType)) {
        return res.status(403).json({ error: 'Not authorized to cancel emergency' });
      }
    }

    emergency.status = 'cancelled';
    emergency.cancelledAt = new Date();
    emergency.addTimelineEvent('cancelled', 'Emergency cancelled by user', req.user.id);
    emergency.updatedBy = req.user.id;

    await emergency.save();

    // Emit real-time cancellation
    io.to(`emergency-${emergency.emergencyId}`).emit('emergency-cancelled', {
      emergencyId: emergency.emergencyId,
      cancelledBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Emergency cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel emergency error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
