const mongoose = require('mongoose');

const waterIntakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { 
    type: Number, 
    required: true,
    min: [0, 'Amount cannot be negative'],
    max: [3000, 'Amount cannot exceed 3000ml at once']
  },
  date: { type: Date, required: true },
  note: { type: String, maxLength: 200 },
  source: { 
    type: String, 
    enum: ['manual', 'small', 'medium', 'large', 'custom'],
    default: 'manual'
  },
  dailyGoal: { 
    type: Number,
    default: 2500,
    min: [1000, 'Daily goal must be at least 1000ml'],
    max: [5000, 'Daily goal cannot exceed 5000ml']
  }
}, {
  timestamps: true
});

// Index for faster queries
waterIntakeSchema.index({ userId: 1, date: -1 });

// Virtual for percentage of daily goal
waterIntakeSchema.virtual('goalPercentage').get(function() {
  return ((this.amount / this.dailyGoal) * 100).toFixed(1);
});

module.exports = mongoose.model('WaterIntake', waterIntakeSchema);
