const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const VitalSignsSchema = new Schema({
  profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  date: { type: Date, required: true, default: Date.now },
  bloodPressure: { systolic: { type: Number }, diastolic: { type: Number } },
  heartRate: { type: Number },
  respiratoryRate: { type: Number },
  temperature: { type: Number },
  oxygenSaturation: { type: Number },
  bloodGlucose: { type: Number },
  weight: { type: Number },
  notes: { type: String, default: '' },
  recordedBy: { type: String, default: 'self' }
}, { timestamps: true });

module.exports = model('VitalSigns', VitalSignsSchema);
