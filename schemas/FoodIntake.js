const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const FoodIntakeSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
  foodItems: { type: String, required: true },
  carbohydrates: { type: Number, required: true, min: 0 },
  proteins: { type: Number, min: 0 },
  fats: { type: Number, min: 0 },
  calories: { type: Number, min: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = model('FoodIntake', FoodIntakeSchema);
