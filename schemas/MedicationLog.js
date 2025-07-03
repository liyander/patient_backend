const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const MedicationLogSchema = new Schema({
  medicationId: { type: Schema.Types.ObjectId, ref: 'Medication', required: true },
  takenAt: { type: Date, required: true },
  dosageTaken: { type: String, required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Index for faster queries by medicationId and date
MedicationLogSchema.index({ medicationId: 1, takenAt: 1 });

module.exports = model('MedicationLog', MedicationLogSchema);