const mongoose = require('mongoose');

const dietSuggestionSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true
    },
    dietName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    items: {
        type: [String],
        default: []
    },
    calories: {
        type: Number
    },
    nutritionalValue: {
        protein: Number,
        carbs: Number,
        fats: Number,
        fiber: Number
    },
    recommendedTime: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'any'],
        default: 'any'
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DietSuggestion', dietSuggestionSchema);