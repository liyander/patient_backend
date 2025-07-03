const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  height: { type: Number, min: 0 },
  weight: { type: Number, min: 0 },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  medicalConditions: [{ type: String }],
  allergies: [{ type: String }],
  currentMedications: [{ type: String }],
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for BMI calculation
ProfileSchema.virtual('bmi').get(function() {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100; // Convert cm to m
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
});

module.exports = model('Profile', ProfileSchema);
