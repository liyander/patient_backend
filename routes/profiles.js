const express = require('express');
const router = express.Router();
const Profile = require('../schemas/UserProfile');

// CREATE a profile
router.post('/', async (req, res) => {
  try {
    const profile = new Profile(req.body);
    const saved = await profile.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a profile by ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await Profile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: 'Profile not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a profile by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Profile.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Profile not found' });
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
