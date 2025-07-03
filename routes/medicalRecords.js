const express = require('express');
const router = express.Router();
const MedicalRecord = require('../schemas/MedicalRecord');

// CREATE a medical record
router.post('/', async (req, res) => {
  try {
    const medicalRecord = new MedicalRecord(req.body);
    const saved = await medicalRecord.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all medical records for a profile
router.get('/profile/:profileId', async (req, res) => {
  try {
    const records = await MedicalRecord.find({ profileId: req.params.profileId })
      .sort({ visitDate: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a single medical record by ID
router.get('/:id', async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Medical record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a medical record
router.put('/:id', async (req, res) => {
  try {
    const updated = await MedicalRecord.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Medical record not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a medical record
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Medical record not found' });
    res.json({ message: 'Medical record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
