const express = require('express');
const router = express.Router();
const MedicationLog = require('../schemas/MedicationLog');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Create a new medication log
router.post('/', async (req, res) => {
  logger.info('Creating new medication log', req.body);
  try {
    // Convert string ID to ObjectId
    const medicationId = mongoose.Types.ObjectId.createFromHexString(req.body.medicationId);
    
    const log = new MedicationLog({
      medicationId,
      takenAt: new Date(req.body.takenAt),
      dosageTaken: req.body.dosageTaken,
      notes: req.body.notes || ''
    });

    const savedLog = await log.save();
    logger.info(`Created new medication log with ID: ${savedLog._id}`);
    res.status(201).json(savedLog);
  } catch (error) {
    logger.error('Error creating medication log', error);
    res.status(400).json({ message: error.message });
  }
});

// Get medication logs by medicationId with optional date filter
router.get('/', async (req, res) => {
  try {
    const { medicationId, date } = req.query;
    logger.info(`Fetching medication logs for medication: ${medicationId}, date: ${date || 'any'}`);

    if (!medicationId) {
      return res.status(400).json({ 
        status: 'error',
        message: 'medicationId is required'
      });
    }

    // Create query object
    const query = { 
      medicationId: new mongoose.Types.ObjectId(medicationId)
    };

    // Add date filter if provided
    if (date) {
      // Create date range for the specified date (start of day to end of day)
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.takenAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const logs = await MedicationLog.find(query).sort({ takenAt: -1 });
    logger.info(`Retrieved ${logs.length} medication logs`);
    res.json(logs);
  } catch (error) {
    logger.error('Error fetching medication logs', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Get medication logs by medicationId
router.get('/medication/:medicationId', async (req, res) => {
  try {
    const { medicationId } = req.params;
    logger.info(`Fetching medication logs for medication: ${medicationId}`);
    
    const logs = await MedicationLog.find({ 
      medicationId: new mongoose.Types.ObjectId(medicationId)
    }).sort({ takenAt: -1 });
    
    logger.info(`Retrieved ${logs.length} medication logs for medicationId ${medicationId}`);
    res.json(logs);
  } catch (error) {
    logger.error(`Error fetching medication logs for medicationId ${req.params.medicationId}`, error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific medication log
router.get('/:id', async (req, res) => {
  try {
    const log = await MedicationLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Medication log not found' 
      });
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

module.exports = router;