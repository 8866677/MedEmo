const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  // Emergency Details
  emergencyId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['medical', 'trauma', 'cardiac', 'respiratory', 'neurological', 'pediatric', 'obstetric', 'other']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  priority: {
    type: String,
    required: true,
    enum: ['routine', 'urgent', 'emergency', 'immediate']
  },
  
  // Patient Information
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: String,
  patientAge: Number,
  patientPhone: String,
  patientBloodGroup: String,
  
  // Location Information
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },
    accuracy: Number, // GPS accuracy in meters
    timestamp: Date
  },
  
  // Emergency Description
  symptoms: [{
    name: String,
    severity: String,
    duration: String
  }],
  description: {
    type: String,
    required: true
  },
  additionalNotes: String,
  
  // Medical Information
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    oxygenSaturation: Number,
    respiratoryRate: Number,
    consciousness: {
      type: String,
      enum: ['alert', 'verbal', 'pain', 'unresponsive']
    }
  },
  
  // Response Assignment
  assignedAmbulance: {
    ambulanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    driverName: String,
    driverPhone: String,
    estimatedArrival: Date,
    currentLocation: {
      latitude: Number,
      longitude: Number,
      timestamp: Date
    }
  },
  
  assignedHospital: {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hospitalName: String,
    hospitalAddress: String,
    estimatedTravelTime: Number, // in minutes
    bedAvailability: {
      general: Number,
      icu: Number,
      emergency: Number
    }
  },
  
  // Status Tracking
  status: {
    type: String,
    required: true,
    enum: ['pending', 'assigned', 'en-route', 'arrived', 'in-transit', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Timeline Events
  timeline: [{
    event: {
      type: String,
      enum: ['created', 'assigned', 'ambulance-dispatched', 'ambulance-arrived', 'patient-picked-up', 'arrived-at-hospital', 'completed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userType: String
  }],
  
  // Response Metrics
  responseTime: {
    alertToAssignment: Number, // in seconds
    assignmentToArrival: Number, // in seconds
    totalResponseTime: Number // in seconds
  },
  
  // Communication
  chatMessages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    senderType: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['sms', 'email', 'push', 'call']
    },
    recipient: String,
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed']
    },
    timestamp: Date,
    retryCount: {
      type: Number,
      default: 0
    }
  }],
  
  // Emergency Contacts Notified
  contactsNotified: [{
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    relationship: String,
    phone: String,
    notificationStatus: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed']
    },
    notifiedAt: Date
  }],
  
  // AI Triage Results
  aiTriage: {
    urgencyScore: Number, // 1-10
    recommendedPriority: String,
    suggestedActions: [String],
    confidence: Number, // 0-1
    analysisTimestamp: Date
  },
  
  // Cost and Insurance
  estimatedCost: {
    ambulance: Number,
    treatment: Number,
    total: Number
  },
  insurance: {
    provider: String,
    policyNumber: String,
    coverage: Number
  },
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpNotes: String,
  
  // Audit Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
emergencySchema.index({ emergencyId: 1 });
emergencySchema.index({ patientId: 1 });
emergencySchema.index({ status: 1 });
emergencySchema.index({ 'location.coordinates': '2dsphere' });
emergencySchema.index({ createdAt: -1 });
emergencySchema.index({ severity: 1, priority: 1 });
emergencySchema.index({ assignedAmbulance: 1 });
emergencySchema.index({ assignedHospital: 1 });

// Pre-save middleware to generate emergency ID
emergencySchema.pre('save', function(next) {
  if (this.isNew && !this.emergencyId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.emergencyId = `EMG-${timestamp}-${random}`;
  }
  
  if (this.isModified('status')) {
    this.timeline.push({
      event: this.status,
      timestamp: new Date(),
      description: `Emergency status changed to ${this.status}`
    });
  }
  
  next();
});

// Method to update response times
emergencySchema.methods.updateResponseTimes = function() {
  if (this.timeline.length >= 2) {
    const created = this.timeline.find(t => t.event === 'created');
    const assigned = this.timeline.find(t => t.event === 'assigned');
    const arrived = this.timeline.find(t => t.event === 'ambulance-arrived');
    
    if (created && assigned) {
      this.responseTime.alertToAssignment = (assigned.timestamp - created.timestamp) / 1000;
    }
    
    if (assigned && arrived) {
      this.responseTime.assignmentToArrival = (arrived.timestamp - assigned.timestamp) / 1000;
    }
    
    if (created && arrived) {
      this.responseTime.totalResponseTime = (arrived.timestamp - created.timestamp) / 1000;
    }
  }
};

// Method to add timeline event
emergencySchema.methods.addTimelineEvent = function(event, description, userId) {
  this.timeline.push({
    event,
    description,
    userId,
    timestamp: new Date()
  });
};

// Method to get current status
emergencySchema.methods.getCurrentStatus = function() {
  return this.status;
};

// Method to check if emergency is active
emergencySchema.methods.isActive = function() {
  return ['pending', 'assigned', 'en-route', 'arrived', 'in-transit'].includes(this.status);
};

// Method to get emergency location
emergencySchema.methods.getLocation = function() {
  return this.location;
};

// Virtual for emergency duration
emergencySchema.virtual('duration').get(function() {
  if (this.status === 'completed' && this.completedAt) {
    return (this.completedAt - this.createdAt) / 1000; // in seconds
  }
  return (Date.now() - this.createdAt) / 1000; // in seconds
});

// Virtual for isUrgent
emergencySchema.virtual('isUrgent').get(function() {
  return this.severity === 'critical' || this.priority === 'immediate';
});

module.exports = mongoose.model('Emergency', emergencySchema);
