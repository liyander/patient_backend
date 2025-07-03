const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the User model - adjust the path if needed
const User = require('../schemas/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health_app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createSampleUser() {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username: 'kavin' });
    if (existingUser) {
      console.log('User "kavin" already exists');
      mongoose.disconnect();
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123', salt);

    // Create the user
    const newUser = new User({
      username: 'kavin',
      email: 'kavin@example.com', // Adding the required email field
      password: hashedPassword,
      // Add any other required fields for your User model
    });

    await newUser.save();
    console.log('Sample user created successfully:');
    console.log('Username: kavin');
    console.log('Email: kavin@example.com');
    console.log('Password: 123');
  } catch (error) {
    console.error('Error creating sample user:', error);
  } finally {
    mongoose.disconnect();
  }
}

createSampleUser();
