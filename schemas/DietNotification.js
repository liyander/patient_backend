const mongoose = require('mongoose');

const dietNotificationSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true
    },
    dietId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DietSuggestion',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DietNotification', dietNotificationSchema);