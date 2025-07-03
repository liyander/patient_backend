// filepath: d:\MERN Projects\health_app\health_api\scripts\seedDietData.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import models
const User = require('../schemas/User');
const Profile = require('../schemas/UserProfile');
const DietPlan = require('../schemas/DietPlan');
const DietSuggestion = require('../schemas/DietSuggestion');
const DietNotification = require('../schemas/DietNotification');

async function seedDietData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get the existing user profile
        const profile = await Profile.findOne({ firstName: 'Kavin' });
        
        if (!profile) {
            console.error('No user profile found. Please run seedDatabase.js first.');
            await mongoose.connection.close();
            return;
        }
        
        console.log(`Found user profile for ${profile.firstName} ${profile.lastName} with ID: ${profile._id}`);

        // Clear existing diet data
        console.log('Clearing existing diet data...');
        await Promise.all([
            DietPlan.deleteMany({}),
            DietSuggestion.deleteMany({}),
            DietNotification.deleteMany({})
        ]);
        console.log('Diet data cleared successfully');

        // Create a diet plan
        console.log('Creating diet plan...');
        const dietPlan = await DietPlan.create({
            userId: profile.user,
            planDetails: 'Low carb, high protein diet designed for Type 2 Diabetes management',
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-07-01')
        });
        console.log('Created diet plan:', { id: dietPlan._id, details: dietPlan.planDetails });

        // Create diet suggestions
        console.log('Creating diet suggestions...');
        const dietSuggestions = [
            {
                patientId: profile._id.toString(),
                dietName: 'Low-Glycemic Breakfast',
                description: 'A balanced breakfast with low glycemic index foods to maintain stable blood sugar levels through the morning.',
                items: ['Steel-cut oatmeal', 'Greek yogurt', 'Berries', 'Almonds', 'Cinnamon'],
                calories: 450,
                nutritionalValue: {
                    protein: 25,
                    carbs: 45,
                    fats: 20,
                    fiber: 8
                },
                recommendedTime: 'breakfast',
                status: 'active'
            },
            {
                patientId: profile._id.toString(),
                dietName: 'Protein-Rich Lunch',
                description: 'A high-protein lunch with complex carbs and healthy fats to sustain energy levels.',
                items: ['Grilled chicken breast', 'Quinoa', 'Avocado', 'Mixed leafy greens', 'Olive oil dressing'],
                calories: 550,
                nutritionalValue: {
                    protein: 40,
                    carbs: 35,
                    fats: 25,
                    fiber: 10
                },
                recommendedTime: 'lunch',
                status: 'active'
            },
            {
                patientId: profile._id.toString(),
                dietName: 'Light Dinner',
                description: 'A light dinner with lean protein and vegetables to avoid blood sugar spikes during sleep.',
                items: ['Baked salmon', 'Steamed broccoli', 'Brown rice', 'Lemon-herb seasoning'],
                calories: 450,
                nutritionalValue: {
                    protein: 35,
                    carbs: 30,
                    fats: 20,
                    fiber: 6
                },
                recommendedTime: 'dinner',
                status: 'active'
            },
            {
                patientId: profile._id.toString(),
                dietName: 'Healthy Snack',
                description: 'A balanced snack to manage hunger between meals without causing blood sugar spikes.',
                items: ['Apple slices', 'Almond butter', 'Cinnamon'],
                calories: 200,
                nutritionalValue: {
                    protein: 5,
                    carbs: 20,
                    fats: 10,
                    fiber: 5
                },
                recommendedTime: 'snack',
                status: 'active'
            },
            {
                patientId: profile._id.toString(),
                dietName: 'Mediterranean Diet Plan',
                description: 'A heart-healthy Mediterranean diet approach that helps manage both diabetes and hypertension.',
                items: ['Olive oil', 'Fish', 'Nuts', 'Whole grains', 'Leafy greens', 'Legumes', 'Fresh fruits'],
                calories: 1800,
                nutritionalValue: {
                    protein: 90,
                    carbs: 180,
                    fats: 80,
                    fiber: 35
                },
                recommendedTime: 'any',
                status: 'active'
            }
        ];

        const savedDietSuggestions = await DietSuggestion.create(dietSuggestions);
        console.log(`Created ${savedDietSuggestions.length} diet suggestions`);

        // Create diet notifications
        console.log('Creating diet notifications...');
        const notifications = [];
        
        for (const suggestion of savedDietSuggestions) {
            notifications.push({
                patientId: profile._id.toString(),
                dietId: suggestion._id,
                message: `New diet suggestion: ${suggestion.dietName} - ${suggestion.description}`,
                read: Math.random() > 0.5 // Randomly mark some as read
            });
        }

        // Add one additional notification about the overall diet plan
        notifications.push({
            patientId: profile._id.toString(),
            dietId: savedDietSuggestions[4]._id, // Using the Mediterranean Diet Plan
            message: "Based on your recent blood glucose readings, we've prepared a customized low-glycemic diet plan to help manage your diabetes.",
            read: false
        });

        const savedNotifications = await DietNotification.insertMany(notifications);
        console.log(`Created ${savedNotifications.length} diet notifications`);

        console.log('\nDiet data seeded successfully!');
        await mongoose.connection.close();

    } catch (error) {
        console.error('Error seeding diet data:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedDietData();