const express = require('express');
const router = express.Router();
const WaterIntake = require('../schemas/WaterIntake');

// Get water intake statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.params.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await WaterIntake.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalAmount: { $sum: { $toDouble: "$amount" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({ data: stats });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Create a new water intake record
router.post('/', async (req, res) => {
  try {
    const waterIntake = new WaterIntake(req.body);
    await waterIntake.save();
    res.status(201).send(waterIntake);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all water intake records for a user
router.get('/:userId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.params.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const waterIntakes = await WaterIntake.find(query)
      .sort({ date: -1 })
      .limit(50);
    res.json({ data: waterIntakes });
  } catch (error) {
    res.status(404).send(error);
  }
});

// Validate amount
const validateAmount = (amount) => {
  if (amount < 0) throw new Error('Amount cannot be negative');
  if (amount > 3000) throw new Error('Amount cannot exceed 3000ml at once');
  return true;
};

// Update a water intake record
router.patch('/:id', async (req, res) => {
  try {
    if (req.body.amount) {
      validateAmount(req.body.amount);
    }
    const waterIntake = await WaterIntake.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(waterIntake);
  } catch (error) {
    res.status(404).send(error);
  }
});

// Delete a water intake record
router.delete('/:id', async (req, res) => {
  try {
    const waterIntake = await WaterIntake.findByIdAndDelete(req.params.id);
    if (!waterIntake) {
      return res.status(404).send({ error: 'Record not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(404).send(error);
  }
});

// Get today's total
router.get('/today/:userId', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const total = await WaterIntake.aggregate([
      {
        $match: {
          userId: req.params.userId,
          date: {
            $gte: today,
            $lt: tomorrow
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.send({ total: total.length > 0 ? total[0].total : 0 });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
