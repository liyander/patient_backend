const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const doctorSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  specialization: { 
    type: String, 
    required: true 
  },
  qualifications: [{ 
    type: String 
  }],
  experience: { 
    type: Number,  // Years of experience
    default: 0
  },
  contactNumber: {
    type: String
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  bio: {
    type: String
  },
  practicingHospital: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  availableSlots: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
      hour: { type: Number, min: 0, max: 23 },
      minute: { type: Number, min: 0, max: 59 }
    },
    endTime: {
      hour: { type: Number, min: 0, max: 23 },
      minute: { type: Number, min: 0, max: 59 }
    },
    slotDuration: { 
      type: Number, 
      default: 30 
    }, // Duration in minutes
    isAvailable: { 
      type: Boolean, 
      default: true 
    }
  }],
  ratings: [{
    patientId: { type: Schema.Types.ObjectId, ref: 'Profile' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    date: { type: Date, default: Date.now }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  profileImage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Virtual for getting full name
doctorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Calculate average rating when ratings are modified
doctorSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
  }
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);