const mongoose = require('mongoose');

const exerciseRecommendationSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true
    },
    exerciseId: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: false
    },
    muscles: {
        type: [String],
        default: []
    },
    equipment: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'skipped'],
        default: 'pending'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ExerciseRecommendation', exerciseRecommendationSchema);