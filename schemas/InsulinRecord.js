const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const InsulinRecordSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  insulinType: { type: String, required: true },
  dosage: { type: Number, required: true, min: 0 },
  injectionSite: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = model('InsulinRecord', InsulinRecordSchema);
