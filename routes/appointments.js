const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import appointment model or define schema
const appointmentSchema = new mongoose.Schema({
    id: String,
    doctorId: String,
    patientId: String,
    doctorName: String,
    patientName: String,
    appointmentDate: Date,
    appointmentTime: {
        hour: Number,
        minute: Number
    },
    reason: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

// Check if model already exists to avoid overwrites
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

// Get pending appointment requests for a doctor
router.get('/requests/:doctorId', async (req, res) => {
    try {
        const appointments = await Appointment.find({
            doctorId: req.params.doctorId,
            status: 'pending'
        });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new appointment
router.post('/', async (req, res) => {
    try {
        const appointment = new Appointment(req.body);
        const savedAppointment = await appointment.save();
        res.status(201).json({ id: savedAppointment._id, message: 'Appointment created successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedAppointment = await Appointment.findOneAndUpdate(
            { id: req.params.id },
            { status },
            { new: true }
        );
        
        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        res.json(updatedAppointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get current appointments for a doctor
router.get('/current/doctor/:doctorId', async (req, res) => {
    try {
        const currentDate = new Date();
        const appointments = await Appointment.find({
            doctorId: req.params.doctorId,
            appointmentDate: { $gte: currentDate },
            status: 'accepted'
        }).sort({ appointmentDate: 1 });
        
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get current appointments for a patient
router.get('/current/patient/:patientId', async (req, res) => {
    try {
        const currentDate = new Date();
        const appointments = await Appointment.find({
            patientId: req.params.patientId,
            appointmentDate: { $gte: currentDate },
            status: 'accepted'
        }).sort({ appointmentDate: 1 });
        
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get appointment history for a doctor
router.get('/history/doctor/:doctorId', async (req, res) => {
    try {
        const currentDate = new Date();
        const appointments = await Appointment.find({
            doctorId: req.params.doctorId,
            status: { $in: ['completed', 'cancelled'] }
        }).sort({ appointmentDate: -1 });
        
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get appointment history for a patient
router.get('/history/patient/:patientId', async (req, res) => {
    try {
        const currentDate = new Date();
        const appointments = await Appointment.find({
            patientId: req.params.patientId,
            appointmentDate: { $lt: currentDate },
            status: 'accepted'
        }).sort({ appointmentDate: -1 });
        
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get appointment counts
router.get('/counts', async (req, res) => {
    try {
        const completedCount = await Appointment.countDocuments({ status: 'completed' });
        const upcomingCount = await Appointment.countDocuments({ status: 'upcoming' });
        const cancelledCount = await Appointment.countDocuments({ status: 'cancelled' });

        res.json({
            completed: completedCount,
            upcoming: upcomingCount,
            cancelled: cancelledCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;