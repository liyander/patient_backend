const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const GlucoseReadingSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  glucoseLevel: { type: Number, required: true, min: 0 },
  readingType: {
    type: String,
    required: true,
    enum: ['fasting', 'pre_meal', 'post_meal', 'bedtime', 'random']
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = model('GlucoseReading', GlucoseReadingSchema);
