const express = require('express');
const router = express.Router();
const FoodIntake = require('../schemas/FoodIntake');
const logger = require('../utils/logger');

// Get all food intake records
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching all food intake records');
    const records = await FoodIntake.find()
      .populate('patient', 'username')
      .sort({ createdAt: -1 });
    logger.info(`Retrieved ${records.length} food intake records`);
    res.json(records);
  } catch (error) {
    logger.error('Error fetching all food intake records', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all food intake records for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    logger.info(`Fetching food intake records for patient: ${req.params.patientId}`);
    const records = await FoodIntake.find({ patient: req.params.patientId })
      .sort({ createdAt: -1 });
    logger.info(`Retrieved ${records.length} food intake records for patient ${req.params.patientId}`);
    res.json(records);
  } catch (error) {
    logger.error(`Error fetching food intake records for patient ${req.params.patientId}`, error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific food intake record
router.get('/:id', async (req, res) => {
  try {
    logger.info(`Fetching food intake record with ID: ${req.params.id}`);
    const record = await FoodIntake.findById(req.params.id);
    if (!record) {
      logger.info(`Food intake record not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Food intake record not found' });
    }
    logger.info(`Retrieved food intake record: ${req.params.id}`);
    res.json(record);
  } catch (error) {
    logger.error(`Error fetching food intake record ${req.params.id}`, error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new food intake record
router.post('/', async (req, res) => {
  logger.info('Creating new food intake record', req.body);
  const record = new FoodIntake({
    patient: req.body.patient,
    mealType: req.body.mealType,
    foodItems: req.body.foodItems,
    carbohydrates: req.body.carbohydrates,
    proteins: req.body.proteins,
    fats: req.body.fats,
    calories: req.body.calories,
    notes: req.body.notes
  });

  try {
    const newRecord = await record.save();
    logger.info(`Created new food intake record with ID: ${newRecord._id}`);
    res.status(201).json(newRecord);
  } catch (error) {
    logger.error('Error creating food intake record', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a food intake record
router.patch('/:id', async (req, res) => {
  try {
    logger.info(`Updating food intake record: ${req.params.id}`, req.body);
    const record = await FoodIntake.findById(req.params.id);
    if (!record) {
      logger.info(`Food intake record not found for update: ${req.params.id}`);
      return res.status(404).json({ message: 'Food intake record not found' });
    }

    const updateFields = [
      'mealType', 'foodItems', 'carbohydrates', 'proteins',
      'fats', 'calories', 'notes'
    ];

    updateFields.forEach(field => {
      if (req.body[field] != null) {
        record[field] = req.body[field];
      }
    });

    const updatedRecord = await record.save();
    logger.info(`Updated food intake record: ${req.params.id}`);
    res.json(updatedRecord);
  } catch (error) {
    logger.error(`Error updating food intake record ${req.params.id}`, error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a food intake record
router.delete('/:id', async (req, res) => {
  try {
    logger.info(`Deleting food intake record: ${req.params.id}`);
    const record = await FoodIntake.findById(req.params.id);
    if (!record) {
      logger.info(`Food intake record not found for deletion: ${req.params.id}`);
      return res.status(404).json({ message: 'Food intake record not found' });
    }
    await FoodIntake.deleteOne({ _id: record._id });
    logger.info(`Deleted food intake record: ${req.params.id}`);
    res.json({ message: 'Food intake record deleted' });
  } catch (error) {
    logger.error(`Error deleting food intake record ${req.params.id}`, error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
