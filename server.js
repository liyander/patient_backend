const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const http = require('http'); // Added for Socket.IO
const socketIO = require('socket.io'); // Added for Socket.IO
const cookieParser = require('cookie-parser'); // Added for cookie handling
const session = require('express-session'); // Added for session management
const MongoStore = require('connect-mongo'); // Added for session store
require('dotenv').config();

const { authenticateToken } = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const authRoutes = require('./routes/auth');

// Define port and host variables
const port = process.env.PORT || 5000;
const host = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIO(server, {  // Configure Socket.IO
    cors: {
        origin: '*',
    }
});

// MongoDB Atlas Connection with retry logic
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;
let isServerListening = false;

const connectWithRetry = async (retryCount = 0) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            heartbeatFrequencyMS: 2000,
            maxPoolSize: 10,
            family: 4,
            autoIndex: true
        });
        console.log('Connected to MongoDB Atlas');
        
        // Only start server after successful database connection and if not already listening
        if (!isServerListening) {
            server.listen(port, host, () => {
                console.log(`Server is running on http://${host}:${port}`);
                isServerListening = true;
            });
        }
    } catch (err) {
        console.error(`MongoDB Atlas connection error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, err);
        
        if (retryCount < MAX_RETRIES - 1) {
            console.log(`Retrying connection in ${RETRY_DELAY/1000} seconds...`);
            setTimeout(() => connectWithRetry(retryCount + 1), RETRY_DELAY);
        } else {
            console.error('Max retry attempts reached. Exiting...');
            process.exit(1);
        }
    }
};

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    // Only try to reconnect if it wasn't a deliberate disconnection
    if (mongoose.connection.readyState !== 0) {
        connectWithRetry();
    }
});

// Handle process events
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});

process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    await mongoose.connection.close();
    process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    await mongoose.connection.close();
    process.exit(1);
});

// Load routes
const profileRoutes = require('./routes/profiles');
const medicalRecordRoutes = require('./routes/medicalRecords');
const medicationRoutes = require('./routes/medications');
const medicationLogRoutes = require('./routes/medicationLogs'); // Added for medication logs
const vitalSignsRoutes = require('./routes/vitalSigns');
const glucoseReadingRoutes = require('./routes/glucoseReadings');
const foodIntakeRoutes = require('./routes/foodIntake');
const insulinRecordRoutes = require('./routes/insulinRecords');
const waterIntakeRoutes = require('./routes/waterIntake');
const dietPlanRoutes = require('./routes/dietPlan');
const appointmentRoutes = require('./routes/appointments'); // Added for appointments
const exerciseRoutes = require('./routes/exerciseRecommendations'); // Added for exercise recommendations
const dietSuggestionRoutes = require('./routes/dietSuggestions'); // Added for diet suggestions
const doctorRoutes = require('./routes/doctors'); // Added for doctors
// const chatRoutes = require('./routes/chat'); // Added for real-time chat

// Global rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Access-Control-Allow-Origin', 
        'Access-Control-Allow-Credentials', 
        'x-csrf-token',
        'cache-control', // Added cache-control header
        'pragma',        // Added pragama which often accompanies cache-control
        'expire'         // Added expire header
    ],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(express.json({ limit: '10kb' }));
app.use(helmet());
app.use(limiter);
app.use(cookieParser()); // Added for cookie handling
app.use(session({ // Added for session management
    secret: process.env.SESSION_SECRET || 'defaultSecret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Logging2
const morganFormat = 'combined';
app.use(morgan(morganFormat, {
    skip: (req, res) => res.statusCode < 400
}));

// Socket.IO event handlers
// require('./socket/index')(io); // We'll create this file

// Health check endpoints - provide both routes for compatibility
app.get('/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'Health API Server Running',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Original health check endpoint with /api prefix
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'Health API Server Running',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// API documentation endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Health API Server Running',
        version: '1.0.0',
        documentation: {
            auth: '/api/auth',
            profiles: '/api/profiles',
            medicalRecords: '/api/medical-records',
            medications: '/api/medications',
            vitalSigns: '/api/vital-signs',
            glucoseReadings: '/api/glucose-readings',
            foodIntake: '/api/food-intake',
            insulinRecords: '/api/insulin-records',
            waterIntake: '/api/water-intake',
            dietPlans: '/api/diet-plans',
            appointments: '/api/appointments',
            exerciseRecommendations: '/api/exercise-recommendations',
            dietSuggestions: '/api/diet-suggestions',
            doctors: '/api/doctors',
            // chat: '/api/chat'
        }
    });
});

// Routes that don't require authentication
app.use('/api/auth', authRoutes);
// // Temporarily make chat routes accessible without authentication for debugging
// app.use('/api/chat', chatRoutes);

// Protected routes
app.use('/api/profiles', authenticateToken, profileRoutes);
app.use('/api/medical-records', authenticateToken, medicalRecordRoutes);
app.use('/api/medications', authenticateToken, medicationRoutes);
app.use('/api/medication-logs', authenticateToken, medicationLogRoutes); // Added for medication logs
app.use('/api/vital-signs', authenticateToken, vitalSignsRoutes);
app.use('/api/glucose-readings', authenticateToken, glucoseReadingRoutes);
app.use('/api/food-intake', authenticateToken, foodIntakeRoutes);
app.use('/api/insulin-records', authenticateToken, insulinRecordRoutes);
app.use('/api/water-intake', authenticateToken, waterIntakeRoutes);
app.use('/api/diet-plans', authenticateToken, dietPlanRoutes);
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/exercise-recommendations', authenticateToken, exerciseRoutes);
app.use('/api/diet-suggestions', authenticateToken, dietSuggestionRoutes);
app.use('/api/doctors', authenticateToken, doctorRoutes); // Added for doctors

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        status: 'error',
        message: 'Resource not found'
    });
});

// Start database connection and server
connectWithRetry();
