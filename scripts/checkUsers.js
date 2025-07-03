// Script to check users in the database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../schemas/User');
const UserProfile = require('../schemas/UserProfile');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB:', err));

async function checkUsers() {
  try {
    console.log('Checking users in the database...');
    
    // Find all users
    const users = await User.find().lean();
    console.log(`Found ${users.length} users:`);
    
    // Display each user's details
    for (const user of users) {
      console.log(`\nUser ID: ${user._id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email || 'No email'}`);
      
      // Check if this is the ID we're looking for
      if (user._id.toString() === '680f57bae32d2848ac4c9ea1') {
        console.log('THIS IS THE USER ID WE ARE LOOKING FOR!');
      }
      
      // Try to find associated profile
      try {
        const profile = await UserProfile.findOne({ user: user._id }).lean();
        if (profile) {
          console.log(`Profile ID: ${profile._id}`);
          console.log(`Name: ${profile.firstName} ${profile.lastName}`);
        } else {
          console.log('No profile found for this user');
        }
      } catch (profileErr) {
        console.error('Error finding profile:', profileErr);
      }
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error checking users:', error);
    await mongoose.connection.close();
  }
}

// Run the function
checkUsers();