const express = require('express');
const router = express.Router();
const ExerciseRecommendation = require('../schemas/ExerciseRecommendation');

// Create a new exercise recommendation
router.post('/', async (req, res) => {
    try {
        const {
            patientId,
            exerciseId,
            name,
            description,
            category,
            muscles,
            equipment,
            timestamp
        } = req.body;

        const newRecommendation = new ExerciseRecommendation({
            patientId,
            exerciseId,
            name,
            description,
            category,
            muscles,
            equipment,
            timestamp,
            status: 'pending'
        });

        const savedRecommendation = await newRecommendation.save();
        
        // Socket.IO notification is handled by the Socket.IO handlers

        res.status(201).json(savedRecommendation);
    } catch (error) {
        console.error('Error creating exercise recommendation:', error);
        res.status(500).json({ message: 'Failed to create exercise recommendation' });
    }
});

// Get all exercise recommendations for a patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const recommendations = await ExerciseRecommendation.find({
            patientId: req.params.patientId
        }).sort({ timestamp: -1 });
        
        res.json(recommendations);
    } catch (error) {
        console.error('Error fetching exercise recommendations:', error);
        res.status(500).json({ message: 'Failed to fetch exercise recommendations' });
    }
});

// Update exercise recommendation status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'completed', 'skipped'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        
        const recommendation = await ExerciseRecommendation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!recommendation) {
            return res.status(404).json({ message: 'Exercise recommendation not found' });
        }
        
        res.json(recommendation);
    } catch (error) {
        console.error('Error updating exercise recommendation:', error);
        res.status(500).json({ message: 'Failed to update exercise recommendation' });
    }
});

// Delete an exercise recommendation
router.delete('/:id', async (req, res) => {
    try {
        const recommendation = await ExerciseRecommendation.findByIdAndDelete(req.params.id);
        
        if (!recommendation) {
            return res.status(404).json({ message: 'Exercise recommendation not found' });
        }
        
        res.json({ message: 'Exercise recommendation deleted successfully' });
    } catch (error) {
        console.error('Error deleting exercise recommendation:', error);
        res.status(500).json({ message: 'Failed to delete exercise recommendation' });
    }
});

module.exports = router;