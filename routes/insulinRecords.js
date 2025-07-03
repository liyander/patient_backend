const express = require('express');
const router = express.Router();
const InsulinRecord = require('../schemas/InsulinRecord');
const logger = require('../utils/logger');

// Get all insulin records
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching all insulin records');
    const records = await InsulinRecord.find()
      .populate('patient', 'username')
      .sort({ createdAt: -1 });
    logger.info(`Retrieved ${records.length} insulin records`);
    res.json(records);
  } catch (error) {
    logger.error('Error fetching all insulin records', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all insulin records for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    logger.info(`Fetching insulin records for patient: ${req.params.patientId}`);
    const records = await InsulinRecord.find({ patient: req.params.patientId })
      .sort({ createdAt: -1 });
    logger.info(`Retrieved ${records.length} insulin records for patient ${req.params.patientId}`);
    res.json(records);
  } catch (error) {
    logger.error(`Error fetching insulin records for patient ${req.params.patientId}`, error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific insulin record
router.get('/:id', async (req, res) => {
  try {
    logger.info(`Fetching insulin record with ID: ${req.params.id}`);
    const record = await InsulinRecord.findById(req.params.id);
    if (!record) {
      logger.info(`Insulin record not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Insulin record not found' });
    }
    logger.info(`Retrieved insulin record: ${req.params.id}`);
    res.json(record);
  } catch (error) {
    logger.error(`Error fetching insulin record ${req.params.id}`, error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new insulin record
router.post('/', async (req, res) => {
  logger.info('Creating new insulin record', req.body);
  const record = new InsulinRecord({
    patient: req.body.patient,
    insulinType: req.body.insulinType,
    dosage: req.body.dosage,
    injectionSite: req.body.injectionSite,
    notes: req.body.notes
  });

  try {
    const newRecord = await record.save();
    logger.info(`Created new insulin record with ID: ${newRecord._id}`);
    res.status(201).json(newRecord);
  } catch (error) {
    logger.error('Error creating insulin record', error);
    res.status(400).json({ message: error.message });
  }
});

// Update an insulin record
router.patch('/:id', async (req, res) => {
  try {
    logger.info(`Updating insulin record: ${req.params.id}`, req.body);
    const record = await InsulinRecord.findById(req.params.id);
    if (!record) {
      logger.info(`Insulin record not found for update: ${req.params.id}`);
      return res.status(404).json({ message: 'Insulin record not found' });
    }

    const updateFields = [
      'insulinType', 'dosage', 'injectionSite', 'notes'
    ];

    updateFields.forEach(field => {
      if (req.body[field] != null) {
        record[field] = req.body[field];
      }
    });

    const updatedRecord = await record.save();
    logger.info(`Updated insulin record: ${req.params.id}`);
    res.json(updatedRecord);
  } catch (error) {
    logger.error(`Error updating insulin record ${req.params.id}`, error);
    res.status(400).json({ message: error.message });
  }
});

// Delete an insulin record
router.delete('/:id', async (req, res) => {
  try {
    logger.info(`Deleting insulin record: ${req.params.id}`);
    const record = await InsulinRecord.findById(req.params.id);
    if (!record) {
      logger.info(`Insulin record not found for deletion: ${req.params.id}`);
      return res.status(404).json({ message: 'Insulin record not found' });
    }
    await InsulinRecord.deleteOne({ _id: record._id });
    logger.info(`Deleted insulin record: ${req.params.id}`);
    res.json({ message: 'Insulin record deleted' });
  } catch (error) {
    logger.error(`Error deleting insulin record ${req.params.id}`, error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
