const mongoose = require('mongoose');
const User = require('../schemas/User');
const Profile = require('../schemas/UserProfile');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health_app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createUserProfile() {
  try {
    // Find the user by username
    const user = await User.findOne({ username: 'kavin' });
    if (!user) {
      console.log('User "kavin" not found');
      mongoose.disconnect();
      return;
    }

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ user: user._id });
    if (existingProfile) {
      console.log(`Profile for user "kavin" already exists with ID: ${existingProfile._id}`);
      mongoose.disconnect();
      return;
    }

    // Create a new profile for the user
    const profile = new Profile({
      user: user._id,
      firstName: 'Kavin',
      lastName: 'Test',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male', // Using lowercase as required by the schema enum
      height: 175, // cm
      weight: 70, // kg
      bloodType: 'O+',
      medicalConditions: ['Diabetes Type 2'],
      allergies: [],
      currentMedications: [],
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Family',
        phone: '123-456-7890'
      }
    });

    await profile.save();
    console.log(`Profile created successfully for user "kavin" with ID: ${profile._id}`);

  } catch (error) {
    console.error('Error creating user profile:', error);
  } finally {
    mongoose.disconnect();
  }
}

createUserProfile();