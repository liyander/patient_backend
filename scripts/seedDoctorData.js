const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import models
const User = require('../schemas/User');
const Doctor = require('../schemas/Doctor');

async function seedDoctorData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing doctor data
        console.log('Clearing existing doctor data...');
        await Doctor.deleteMany({});
        console.log('Doctor data cleared successfully');

        // Create doctor users first
        console.log('Creating doctor users...');
        
        const doctorUsers = [
            {
                username: 'dr.smith',
                email: 'drsmith@example.com',
                password: await bcrypt.hash('123', 10)
            },
            {
                username: 'dr.johnson',
                email: 'drjohnson@example.com',
                password: await bcrypt.hash('123', 10)
            },
            {
                username: 'dr.wilson',
                email: 'drwilson@example.com',
                password: await bcrypt.hash('123', 10)
            },
            {
                username: 'dr.chen',
                email: 'drchen@example.com',
                password: await bcrypt.hash('123', 10)
            },
            {
                username: 'dr.patel',
                email: 'drpatel@example.com',
                password: await bcrypt.hash('123', 10)
            }
        ];

        // Create users in the database
        const savedUsers = await User.create(doctorUsers);
        console.log(`Created ${savedUsers.length} doctor user accounts`);

        // Create doctor profiles with reference to the user accounts
        console.log('Creating doctor profiles...');

        const doctorData = [
            {
                user: savedUsers[0]._id,
                firstName: 'Robert',
                lastName: 'Smith',
                specialization: 'Cardiologist',
                qualifications: ['MD', 'FACC', 'Board Certified Cardiology'],
                experience: 15,
                contactNumber: '555-123-4567',
                email: 'drsmith@example.com',
                bio: 'Dr. Smith specializes in cardiovascular health with a focus on preventive care.',
                practicingHospital: 'Central Medical Center',
                address: {
                    street: '123 Medical Lane',
                    city: 'Boston',
                    state: 'MA',
                    zipCode: '02115'
                },
                availableSlots: [
                    {
                        day: 'Monday',
                        startTime: { hour: 9, minute: 0 },
                        endTime: { hour: 17, minute: 0 },
                        slotDuration: 30
                    },
                    {
                        day: 'Wednesday',
                        startTime: { hour: 9, minute: 0 },
                        endTime: { hour: 17, minute: 0 },
                        slotDuration: 30
                    },
                    {
                        day: 'Friday',
                        startTime: { hour: 9, minute: 0 },
                        endTime: { hour: 13, minute: 0 },
                        slotDuration: 30
                    }
                ],
                ratings: [
                    {
                        rating: 5,
                        review: 'Dr. Smith is incredibly knowledgeable and attentive.',
                        date: new Date('2025-03-15')
                    },
                    {
                        rating: 4,
                        review: 'Great doctor, but sometimes running behind schedule.',
                        date: new Date('2025-02-22')
                    }
                ],
                profileImage: 'https://randomuser.me/api/portraits/men/36.jpg'
            },
            {
                user: savedUsers[1]._id,
                firstName: 'Emily',
                lastName: 'Johnson',
                specialization: 'Endocrinologist',
                qualifications: ['MD', 'PhD', 'Board Certified Endocrinology'],
                experience: 10,
                contactNumber: '555-234-5678',
                email: 'drjohnson@example.com',
                bio: 'Dr. Johnson specializes in diabetes management and thyroid disorders.',
                practicingHospital: 'University Hospital',
                address: {
                    street: '456 Health Avenue',
                    city: 'Boston',
                    state: 'MA',
                    zipCode: '02116'
                },
                availableSlots: [
                    {
                        day: 'Tuesday',
                        startTime: { hour: 8, minute: 30 },
                        endTime: { hour: 16, minute: 30 },
                        slotDuration: 30
                    },
                    {
                        day: 'Thursday',
                        startTime: { hour: 8, minute: 30 },
                        endTime: { hour: 16, minute: 30 },
                        slotDuration: 30
                    }
                ],
                ratings: [
                    {
                        rating: 5,
                        review: 'Dr. Johnson has helped me manage my diabetes effectively.',
                        date: new Date('2025-04-05')
                    },
                    {
                        rating: 5,
                        review: 'Very thorough and explains everything clearly.',
                        date: new Date('2025-03-12')
                    },
                    {
                        rating: 4,
                        review: 'Excellent doctor with a caring approach.',
                        date: new Date('2025-02-28')
                    }
                ],
                profileImage: 'https://randomuser.me/api/portraits/women/65.jpg'
            },
            {
                user: savedUsers[2]._id,
                firstName: 'James',
                lastName: 'Wilson',
                specialization: 'Neurologist',
                qualifications: ['MD', 'Board Certified Neurology'],
                experience: 12,
                contactNumber: '555-345-6789',
                email: 'drwilson@example.com',
                bio: 'Dr. Wilson is a specialist in neurological disorders with expertise in headache management.',
                practicingHospital: 'Metro Neurology Center',
                address: {
                    street: '789 Brain Drive',
                    city: 'Cambridge',
                    state: 'MA',
                    zipCode: '02139'
                },
                availableSlots: [
                    {
                        day: 'Monday',
                        startTime: { hour: 10, minute: 0 },
                        endTime: { hour: 18, minute: 0 },
                        slotDuration: 45
                    },
                    {
                        day: 'Wednesday',
                        startTime: { hour: 10, minute: 0 },
                        endTime: { hour: 18, minute: 0 },
                        slotDuration: 45
                    },
                    {
                        day: 'Thursday',
                        startTime: { hour: 10, minute: 0 },
                        endTime: { hour: 16, minute: 0 },
                        slotDuration: 45
                    }
                ],
                ratings: [
                    {
                        rating: 5,
                        review: 'Dr. Wilson is amazing. He finally diagnosed my condition correctly.',
                        date: new Date('2025-04-02')
                    },
                    {
                        rating: 4,
                        review: 'Very knowledgeable doctor. Appointments can run long.',
                        date: new Date('2025-03-18')
                    }
                ],
                profileImage: 'https://randomuser.me/api/portraits/men/42.jpg'
            },
            {
                user: savedUsers[3]._id,
                firstName: 'Michael',
                lastName: 'Chen',
                specialization: 'Pulmonologist',
                qualifications: ['MD', 'FCCP', 'Board Certified Pulmonary Medicine'],
                experience: 8,
                contactNumber: '555-456-7890',
                email: 'drchen@example.com',
                bio: 'Dr. Chen specializes in respiratory disorders and sleep medicine.',
                practicingHospital: 'Respiratory Care Center',
                address: {
                    street: '101 Lung Street',
                    city: 'Brookline',
                    state: 'MA',
                    zipCode: '02445'
                },
                availableSlots: [
                    {
                        day: 'Tuesday',
                        startTime: { hour: 9, minute: 0 },
                        endTime: { hour: 17, minute: 0 },
                        slotDuration: 30
                    },
                    {
                        day: 'Friday',
                        startTime: { hour: 9, minute: 0 },
                        endTime: { hour: 17, minute: 0 },
                        slotDuration: 30
                    }
                ],
                ratings: [
                    {
                        rating: 5,
                        review: 'Dr. Chen is excellent with asthma management.',
                        date: new Date('2025-03-25')
                    }
                ],
                profileImage: 'https://randomuser.me/api/portraits/men/59.jpg'
            },
            {
                user: savedUsers[4]._id,
                firstName: 'Priya',
                lastName: 'Patel',
                specialization: 'Endocrinologist',
                qualifications: ['MD', 'Board Certified Endocrinology'],
                experience: 7,
                contactNumber: '555-567-8901',
                email: 'drpatel@example.com',
                bio: 'Dr. Patel focuses on hormone-related conditions with special expertise in diabetes care.',
                practicingHospital: 'Diabetes Care Clinic',
                address: {
                    street: '202 Endocrine Avenue',
                    city: 'Boston',
                    state: 'MA',
                    zipCode: '02118'
                },
                availableSlots: [
                    {
                        day: 'Monday',
                        startTime: { hour: 8, minute: 0 },
                        endTime: { hour: 14, minute: 0 },
                        slotDuration: 30
                    },
                    {
                        day: 'Thursday',
                        startTime: { hour: 12, minute: 0 },
                        endTime: { hour: 18, minute: 0 },
                        slotDuration: 30
                    }
                ],
                ratings: [
                    {
                        rating: 5,
                        review: 'Dr. Patel listens carefully and creates personalized treatment plans.',
                        date: new Date('2025-04-10')
                    },
                    {
                        rating: 5,
                        review: 'She is wonderful with diabetic patients.',
                        date: new Date('2025-03-05')
                    },
                    {
                        rating: 4,
                        review: 'Very knowledgeable and patient.',
                        date: new Date('2025-02-15')
                    }
                ],
                profileImage: 'https://randomuser.me/api/portraits/women/33.jpg'
            }
        ];

        // Calculate average ratings before saving
        doctorData.forEach(doctor => {
            if (doctor.ratings && doctor.ratings.length > 0) {
                const totalRating = doctor.ratings.reduce((sum, rating) => sum + rating.rating, 0);
                doctor.averageRating = totalRating / doctor.ratings.length;
            }
        });

        // Create doctors in the database
        const savedDoctors = await Doctor.create(doctorData);
        console.log(`Created ${savedDoctors.length} doctor profiles`);

        // Create appointments with doctors and existing patients
        console.log('Sample doctors have been created successfully!');
        
        await mongoose.connection.close();
        console.log('MongoDB connection closed');

    } catch (error) {
        console.error('Error seeding doctor data:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedDoctorData();