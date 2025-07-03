const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import models
const User = require('../schemas/User');
const Profile = require('../schemas/UserProfile');
const Doctor = require('../schemas/Doctor');

// Import appointment model or create it
const appointmentSchema = new mongoose.Schema({
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

async function seedAppointmentData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing appointment data
        console.log('Clearing existing appointment data...');
        await Appointment.deleteMany({});
        console.log('Appointment data cleared successfully');

        // Get sample patient and doctor data
        const patient = await Profile.findOne({ firstName: 'Kavin' });
        if (!patient) {
            console.error('No patient found. Please run seedDatabase.js first.');
            await mongoose.connection.close();
            return;
        }

        const doctors = await Doctor.find({});
        if (doctors.length === 0) {
            console.error('No doctors found. Please run seedDoctorData.js first.');
            await mongoose.connection.close();
            return;
        }

        console.log(`Found patient ${patient.firstName} ${patient.lastName} and ${doctors.length} doctors`);

        // Create appointments for various dates and statuses
        const today = new Date();
        const appointments = [];

        // Past appointments (completed)
        for (let i = 1; i <= 3; i++) {
            const pastDate = new Date(today);
            pastDate.setDate(today.getDate() - (i * 7)); // Appointments from previous weeks
            
            const doctor = doctors[i % doctors.length]; // Cycle through doctors
            
            appointments.push({
                doctorId: doctor._id.toString(),
                patientId: patient._id.toString(),
                doctorName: `${doctor.firstName} ${doctor.lastName}`,
                patientName: `${patient.firstName} ${patient.lastName}`,
                appointmentDate: pastDate,
                appointmentTime: {
                    hour: 10 + i,
                    minute: 0
                },
                reason: [
                    'Regular checkup', 
                    'Diabetes management', 
                    'Blood pressure monitoring', 
                    'Medication review'
                ][i % 4],
                status: 'completed'
            });
        }

        // Current/upcoming appointments
        for (let i = 1; i <= 2; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + (i * 5)); // Appointments in coming days
            
            const doctor = doctors[(i + 2) % doctors.length]; // Different doctors
            
            appointments.push({
                doctorId: doctor._id.toString(),
                patientId: patient._id.toString(),
                doctorName: `${doctor.firstName} ${doctor.lastName}`,
                patientName: `${patient.firstName} ${patient.lastName}`,
                appointmentDate: futureDate,
                appointmentTime: {
                    hour: 9 + i,
                    minute: 30
                },
                reason: [
                    'Follow-up consultation', 
                    'New symptoms discussion',
                    'Lab results review'
                ][i % 3],
                status: 'accepted'
            });
        }

        // Pending appointment requests
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 10);
        appointments.push({
            doctorId: doctors[0]._id.toString(),
            patientId: patient._id.toString(),
            doctorName: `${doctors[0].firstName} ${doctors[0].lastName}`,
            patientName: `${patient.firstName} ${patient.lastName}`,
            appointmentDate: futureDate,
            appointmentTime: {
                hour: 14,
                minute: 0
            },
            reason: 'Annual physical examination',
            status: 'pending'
        });

        // Cancelled appointment
        const cancelledDate = new Date(today);
        cancelledDate.setDate(today.getDate() + 3);
        appointments.push({
            doctorId: doctors[1]._id.toString(),
            patientId: patient._id.toString(),
            doctorName: `${doctors[1].firstName} ${doctors[1].lastName}`,
            patientName: `${patient.firstName} ${patient.lastName}`,
            appointmentDate: cancelledDate,
            appointmentTime: {
                hour: 11,
                minute: 15
            },
            reason: 'Prescription renewal',
            status: 'cancelled'
        });

        // Create appointments in the database
        const savedAppointments = await Appointment.create(appointments);
        console.log(`Created ${savedAppointments.length} appointments`);

        console.log('Sample appointments have been created successfully!');
        
        await mongoose.connection.close();
        console.log('MongoDB connection closed');

    } catch (error) {
        console.error('Error seeding appointment data:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedAppointmentData();