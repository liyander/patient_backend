const mongoose = require('mongoose');
const User = require('../schemas/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health_app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function resetPassword() {
  try {
    // Find the user by username
    const user = await User.findOne({ username: 'kavin' });
    if (!user) {
      console.log('User "kavin" not found');
      mongoose.disconnect();
      return;
    }

    // Set the new password (the User schema will hash it automatically)
    user.password = '123456';
    await user.save();

    console.log('Password has been reset successfully for user "kavin"');
    console.log('New password: 123456');
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    mongoose.disconnect();
  }
}

resetPassword();