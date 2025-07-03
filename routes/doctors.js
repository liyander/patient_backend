const express = require('express');
const router = express.Router();
const Doctor = require('../schemas/Doctor');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (err) {
    logger.error('Error fetching doctors:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get a specific doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (err) {
    logger.error(`Error fetching doctor with ID ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new doctor
router.post('/', async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();
    res.status(201).json(savedDoctor);
  } catch (err) {
    logger.error('Error creating doctor:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update a doctor
router.patch('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (err) {
    logger.error(`Error updating doctor with ID ${req.params.id}:`, err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a doctor
router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting doctor with ID ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// Get doctors by specialization
router.get('/specialization/:specialization', async (req, res) => {
  try {
    const doctors = await Doctor.find({ specialization: req.params.specialization });
    res.json(doctors);
  } catch (err) {
    logger.error(`Error fetching doctors with specialization ${req.params.specialization}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// Add available slots to a doctor
router.post('/:id/slots', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Add slots to doctor's availableSlots array
    doctor.availableSlots.push(...req.body.slots);
    
    const updatedDoctor = await doctor.save();
    res.status(201).json(updatedDoctor.availableSlots);
  } catch (err) {
    logger.error(`Error adding slots for doctor with ID ${req.params.id}:`, err);
    res.status(400).json({ message: err.message });
  }
});

// Update an available slot for a doctor
router.patch('/:id/slots/:slotId', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Find the slot to update
    const slot = doctor.availableSlots.id(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    // Update slot properties
    Object.assign(slot, req.body);
    
    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor.availableSlots);
  } catch (err) {
    logger.error(`Error updating slot for doctor with ID ${req.params.id}:`, err);
    res.status(400).json({ message: err.message });
  }
});

// Get doctors with available slots on a specific day
router.get('/available/:day', async (req, res) => {
  try {
    const doctors = await Doctor.find({
      'availableSlots.day': req.params.day,
      'availableSlots.isAvailable': true
    });
    res.json(doctors);
  } catch (err) {
    logger.error(`Error fetching available doctors on ${req.params.day}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// Add a rating for a doctor
router.post('/:id/ratings', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    doctor.ratings.push(req.body);
    const updatedDoctor = await doctor.save();
    res.status(201).json(updatedDoctor);
  } catch (err) {
    logger.error(`Error adding rating for doctor with ID ${req.params.id}:`, err);
    res.status(400).json({ message: err.message });
  }
});

// Get top rated doctors
router.get('/top-rated/:limit', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 5;
    const doctors = await Doctor.find({})
      .sort({ averageRating: -1 })
      .limit(limit);
    res.json(doctors);
  } catch (err) {
    logger.error('Error fetching top rated doctors:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;