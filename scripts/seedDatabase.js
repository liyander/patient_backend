const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import models
const User = require('../schemas/User');
const Profile = require('../schemas/UserProfile');
const GlucoseReading = require('../schemas/GlucoseReading');
const MedicalRecord = require('../schemas/MedicalRecord');
const Medication = require('../schemas/Medication');

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Profile.deleteMany({}),
            GlucoseReading.deleteMany({}),
            MedicalRecord.deleteMany({}),
            Medication.deleteMany({})
        ]);
        console.log('Data cleared successfully');

        // Create single user
        console.log('Creating user...');
        const user = await User.create({
            username: 'kavin',
            email: 'kavin@example.com',
            password: '123' // Password will be hashed by pre-save hook
        });
        console.log('Created user:', { id: user._id, username: user.username, email: user.email });

        // Create profile for the user
        console.log('Creating user profile...');
        const profile = await Profile.create({
            user: user._id,
            firstName: 'Kavin',
            lastName: 'Kumar',
            dateOfBirth: new Date('1990-05-15'),
            gender: 'male',
            height: 175,
            weight: 75,
            bloodType: 'O+',
            medicalConditions: ['Type 2 Diabetes', 'Hypertension'],
            allergies: ['Penicillin'],
            currentMedications: ['Metformin', 'Lisinopril'],
            emergencyContact: {
                name: 'Maya Kumar',
                relationship: 'Wife',
                phone: '555-0123'
            }
        });
        console.log('Created profile:', { id: profile._id, name: `${profile.firstName} ${profile.lastName}`, userId: profile.user });

        // Create glucose readings for Kavin
        console.log('Creating glucose readings...');
        const today = new Date();
        const glucoseReadings = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            glucoseReadings.push({
                patient: profile._id,
                glucoseLevel: Math.floor(Math.random() * (180 - 70) + 70),
                readingType: 'fasting',
                notes: 'Morning reading',
                createdAt: new Date(date.setHours(8, 0, 0))
            });

            glucoseReadings.push({
                patient: profile._id,
                glucoseLevel: Math.floor(Math.random() * (200 - 100) + 100),
                readingType: 'post_meal',
                notes: 'After lunch',
                createdAt: new Date(date.setHours(14, 0, 0))
            });
        }

        await GlucoseReading.create(glucoseReadings);
        console.log(`Created ${glucoseReadings.length} glucose readings`);

        // Create medications
        console.log('Creating medications...');
        const medications = [
            {
                profileId: profile._id,
                name: 'Metformin',
                dosage: '500mg',
                frequency: 'Twice daily',
                startDate: new Date('2025-01-01'),
                prescribedBy: 'Dr. Smith',
                purpose: 'Diabetes management',
                sideEffects: ['Nausea', 'Diarrhea'],
                notes: 'Take with meals'
            },
            {
                profileId: profile._id,
                name: 'Lisinopril',
                dosage: '10mg',
                frequency: 'Once daily',
                startDate: new Date('2025-02-15'),
                prescribedBy: 'Dr. Johnson',
                purpose: 'Blood pressure control',
                sideEffects: ['Dizziness', 'Cough'],
                notes: 'Take in the morning'
            },
            {
                profileId: profile._id,
                name: 'Atorvastatin',
                dosage: '20mg',
                frequency: 'Once daily',
                startDate: new Date('2025-03-10'),
                prescribedBy: 'Dr. Smith',
                purpose: 'Cholesterol management',
                sideEffects: ['Muscle pain', 'Fatigue'],
                notes: 'Take in the evening'
            },
            {
                profileId: profile._id,
                name: 'Aspirin',
                dosage: '81mg',
                frequency: 'Once daily',
                startDate: new Date('2025-01-15'),
                prescribedBy: 'Dr. Smith',
                purpose: 'Heart attack prevention',
                sideEffects: ['Stomach upset', 'Bleeding risk'],
                notes: 'Take with food'
            },
            {
                profileId: profile._id,
                name: 'Glimepiride',
                dosage: '2mg',
                frequency: 'Once daily',
                startDate: new Date('2025-04-01'),
                prescribedBy: 'Dr. Wilson',
                purpose: 'Blood sugar control',
                sideEffects: ['Hypoglycemia', 'Dizziness'],
                notes: 'Take with breakfast'
            },
            {
                profileId: profile._id,
                name: 'CoQ10',
                dosage: '100mg',
                frequency: 'Once daily',
                startDate: new Date('2025-03-20'),
                prescribedBy: 'Dr. Wilson',
                purpose: 'Heart health support',
                sideEffects: ['Insomnia'],
                notes: 'Take with fatty meal'
            },
            {
                profileId: profile._id,
                name: 'Vitamin D',
                dosage: '2000IU',
                frequency: 'Once daily',
                startDate: new Date('2025-02-01'),
                prescribedBy: 'Dr. Johnson',
                purpose: 'Vitamin deficiency',
                sideEffects: [],
                notes: 'Take with fatty meal for better absorption'
            },
            {
                profileId: profile._id,
                name: 'Losartan',
                dosage: '50mg',
                frequency: 'Once daily',
                startDate: new Date('2025-04-15'),
                prescribedBy: 'Dr. Smith',
                purpose: 'Blood pressure control',
                sideEffects: ['Dizziness', 'Fatigue'],
                notes: 'Take at the same time each day'
            }
        ];

        const savedMedications = await Medication.create(medications);
        console.log(`Created ${savedMedications.length} medications`);

        // Create medical records
        console.log('Creating medical records...');
        const medicalRecords = [
            {
                profileId: profile._id,
                visitDate: new Date('2025-01-05'),
                doctorName: 'Dr. Smith',
                diagnosis: 'Type 2 Diabetes',
                symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue'],
                treatment: 'Prescribed Metformin 500mg twice daily',
                notes: 'Patient advised to monitor blood glucose levels daily',
                followUpDate: new Date('2025-02-05')
            },
            {
                profileId: profile._id,
                visitDate: new Date('2025-02-05'),
                doctorName: 'Dr. Smith',
                diagnosis: 'Hypertension',
                symptoms: ['Headache', 'Dizziness'],
                treatment: 'Prescribed Lisinopril 10mg once daily',
                notes: 'Patient advised to reduce sodium intake and increase physical activity',
                followUpDate: new Date('2025-03-05')
            },
            {
                profileId: profile._id,
                visitDate: new Date('2025-03-10'),
                doctorName: 'Dr. Wilson',
                diagnosis: 'Annual Checkup',
                symptoms: ['None'],
                treatment: 'Added Vitamin D supplementation',
                notes: 'Overall health is good, continue current medication regimen',
                followUpDate: new Date('2026-03-10')
            },
            {
                profileId: profile._id,
                visitDate: new Date('2025-04-15'),
                doctorName: 'Dr. Smith',
                diagnosis: 'Blood Pressure Review',
                symptoms: ['Occasional headaches'],
                treatment: 'Switched from Lisinopril to Losartan due to persistent cough',
                notes: 'Monitor for side effects from new medication',
                followUpDate: new Date('2025-05-15')
            }
        ];

        const savedMedicalRecords = await MedicalRecord.create(medicalRecords);
        console.log(`Created ${savedMedicalRecords.length} medical records`);

        // Verify passwords can be checked
        console.log('\nVerifying password functionality...');
        const testUser = await User.findOne({ username: 'kavin' });
        const passwordMatch = await testUser.comparePassword('123');
        console.log('Password verification test:', passwordMatch ? 'PASSED' : 'FAILED');

        console.log('\nDatabase seeded successfully!');
        await mongoose.connection.close();

    } catch (error) {
        console.error('Error seeding database:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedDatabase();
