const express = require('express');
const router = express.Router();
const DietSuggestion = require('../schemas/DietSuggestion');
const DietNotification = require('../schemas/DietNotification');

// Create a new diet suggestion
router.post('/', async (req, res) => {
    try {
        const suggestion = new DietSuggestion(req.body);
        await suggestion.save();
        res.status(201).send(suggestion);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Get all diet suggestions
router.get('/', async (req, res) => {
    try {
        const suggestions = await DietSuggestion.find();
        res.status(200).send(suggestions);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get diet suggestions for a specific patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const suggestions = await DietSuggestion.find({ patientId: req.params.patientId });
        res.status(200).send(suggestions);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Update a diet suggestion
router.put('/:id', async (req, res) => {
    try {
        const updatedSuggestion = await DietSuggestion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedSuggestion) {
            return res.status(404).send({ error: 'Diet suggestion not found' });
        }
        res.send(updatedSuggestion);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Delete a diet suggestion
router.delete('/:id', async (req, res) => {
    try {
        const suggestion = await DietSuggestion.findByIdAndDelete(req.params.id);
        if (!suggestion) {
            return res.status(404).send({ error: 'Diet suggestion not found' });
        }
        res.send({ message: 'Diet suggestion deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Notify patient about diet suggestion
router.post('/notify-patient', async (req, res) => {
    try {
        const notification = new DietNotification(req.body);
        await notification.save();
        res.status(201).send(notification);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Get notifications for a patient
router.get('/notifications/:patientId', async (req, res) => {
    try {
        const notifications = await DietNotification.find({ 
            patientId: req.params.patientId 
        }).populate('dietId').sort({ createdAt: -1 });
        
        res.status(200).send(notifications);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Mark notification as read
router.patch('/notifications/:id/read', async (req, res) => {
    try {
        const notification = await DietNotification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).send({ error: 'Notification not found' });
        }
        
        res.send(notification);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;