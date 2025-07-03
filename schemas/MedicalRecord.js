const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const MedicalRecordSchema = new Schema({
  profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  visitDate: { type: Date, required: true },
  doctorName: { type: String, required: true },
  diagnosis: { type: String, required: true },
  symptoms: { type: [String], default: [] },
  treatment: { type: String, default: '' },
  notes: { type: String, default: '' },
  followUpDate: { type: Date },
  attachments: { type: [String], default: [] }
}, { timestamps: true });

module.exports = model('MedicalRecord', MedicalRecordSchema);
