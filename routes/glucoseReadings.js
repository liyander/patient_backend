const express = require('express');
const router = express.Router();
const GlucoseReading = require('../schemas/GlucoseReading');
const logger = require('../utils/logger');

// Get all glucose readings
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching all glucose readings');
    const readings = await GlucoseReading.find()
      .populate('patient', 'username')
      .sort({ createdAt: -1 });
    logger.info(`Retrieved ${readings.length} glucose readings`);
    res.json(readings);
  } catch (error) {
    logger.error('Error fetching all glucose readings', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all glucose readings for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    logger.info(`Fetching glucose readings for patient: ${req.params.patientId}`);
    const readings = await GlucoseReading.find({ patient: req.params.patientId })
      .sort({ createdAt: -1 });
    logger.info(`Retrieved ${readings.length} glucose readings for patient ${req.params.patientId}`);
    res.json(readings);
  } catch (error) {
    logger.error(`Error fetching glucose readings for patient ${req.params.patientId}`, error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific glucose reading
router.get('/:id', async (req, res) => {
  try {
    logger.info(`Fetching glucose reading with ID: ${req.params.id}`);
    const reading = await GlucoseReading.findById(req.params.id);
    if (!reading) {
      logger.info(`Glucose reading not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Glucose reading not found' });
    }
    logger.info(`Retrieved glucose reading: ${req.params.id}`);
    res.json(reading);
  } catch (error) {
    logger.error(`Error fetching glucose reading ${req.params.id}`, error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new glucose reading
router.post('/', async (req, res) => {
  logger.info('Creating new glucose reading', req.body);
  const reading = new GlucoseReading({
    patient: req.body.patient,
    glucoseLevel: req.body.glucoseLevel,
    readingType: req.body.readingType,
    notes: req.body.notes
  });

  try {
    const newReading = await reading.save();
    logger.info(`Created new glucose reading with ID: ${newReading._id}`);
    res.status(201).json(newReading);
  } catch (error) {
    logger.error('Error creating glucose reading', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a glucose reading
router.patch('/:id', async (req, res) => {
  try {
    logger.info(`Updating glucose reading: ${req.params.id}`, req.body);
    const reading = await GlucoseReading.findById(req.params.id);
    if (!reading) {
      logger.info(`Glucose reading not found for update: ${req.params.id}`);
      return res.status(404).json({ message: 'Glucose reading not found' });
    }

    if (req.body.glucoseLevel != null) {
      reading.glucoseLevel = req.body.glucoseLevel;
    }
    if (req.body.readingType != null) {
      reading.readingType = req.body.readingType;
    }
    if (req.body.notes != null) {
      reading.notes = req.body.notes;
    }

    const updatedReading = await reading.save();
    logger.info(`Updated glucose reading: ${req.params.id}`);
    res.json(updatedReading);
  } catch (error) {
    logger.error(`Error updating glucose reading ${req.params.id}`, error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a glucose reading
router.delete('/:id', async (req, res) => {
  try {
    logger.info(`Deleting glucose reading: ${req.params.id}`);
    const reading = await GlucoseReading.findById(req.params.id);
    if (!reading) {
      logger.info(`Glucose reading not found for deletion: ${req.params.id}`);
      return res.status(404).json({ message: 'Glucose reading not found' });
    }
    await GlucoseReading.deleteOne({ _id: reading._id });
    logger.info(`Deleted glucose reading: ${req.params.id}`);
    res.json({ message: 'Glucose reading deleted' });
  } catch (error) {
    logger.error(`Error deleting glucose reading ${req.params.id}`, error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
