const express = require('express');
const router = express.Router();
const VitalSigns = require('../schemas/VitalSigns');

// CREATE vital signs record
router.post('/', async (req, res) => {
  try {
    const vitalSigns = new VitalSigns(req.body);
    const saved = await vitalSigns.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all vital signs for a profile
router.get('/profile/:profileId', async (req, res) => {
  try {
    const vitalSigns = await VitalSigns.find({ profileId: req.params.profileId })
      .sort({ date: -1 });
    res.json(vitalSigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ latest vital signs for a profile
router.get('/profile/:profileId/latest', async (req, res) => {
  try {
    const latestVitalSigns = await VitalSigns.findOne({ 
      profileId: req.params.profileId 
    }).sort({ date: -1 });
    
    if (!latestVitalSigns) {
      return res.status(404).json({ error: 'No vital signs records found for this profile' });
    }
    
    res.json(latestVitalSigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ vital signs by date range
router.get('/profile/:profileId/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const vitalSigns = await VitalSigns.find({
      profileId: req.params.profileId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: -1 });
    
    res.json(vitalSigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a single vital signs record by ID
router.get('/:id', async (req, res) => {
  try {
    const vitalSigns = await VitalSigns.findById(req.params.id);
    if (!vitalSigns) return res.status(404).json({ error: 'Vital signs record not found' });
    res.json(vitalSigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a vital signs record
router.put('/:id', async (req, res) => {
  try {
    const updated = await VitalSigns.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Vital signs record not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a vital signs record
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await VitalSigns.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Vital signs record not found' });
    res.json({ message: 'Vital signs record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
