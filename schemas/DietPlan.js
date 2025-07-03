const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planDetails: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
