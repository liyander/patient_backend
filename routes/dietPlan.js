const express = require('express');
const router = express.Router();
const DietPlan = require('../schemas/DietPlan');

// Create a new diet plan
router.post('/', async (req, res) => {
  try {
    const dietPlan = new DietPlan(req.body);
    await dietPlan.save();
    res.status(201).send(dietPlan);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all diet plans for a user
router.get('/:userId', async (req, res) => {
  try {
    const dietPlans = await DietPlan.find({ userId: req.params.userId });
    res.send(dietPlans);
  } catch (error) {
    res.status(404).send(error);
  }
});

// Update a diet plan
router.patch('/:id', async (req, res) => {
  try {
    const dietPlan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(dietPlan);
  } catch (error) {
    res.status(404).send(error);
  }
});

// Delete a diet plan
router.delete('/:id', async (req, res) => {
  try {
    await DietPlan.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).send(error);
  }
});

module.exports = router;
