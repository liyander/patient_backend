const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../schemas/Message');
const User = require('../schemas/User');
const Doctor = require('../schemas/Doctor');
const UserProfile = require('../schemas/UserProfile'); // Added UserProfile schema

// Get all chat rooms for a user (patient)
router.get('/rooms/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find all unique room IDs where the user is involved
        const rooms = await Message.aggregate([
            { $match: { $or: [
                { senderId: userId },
                { roomId: { $regex: userId } }
            ]}},
            { $group: { _id: "$roomId" }},
            { $project: { roomId: "$_id", _id: 0 }}
        ]);

        // Get the latest message for each room
        const roomsWithDetails = await Promise.all(rooms.map(async (room) => {
            // Find the latest message
            const latestMessage = await Message.findOne({ roomId: room.roomId })
                .sort({ timestamp: -1 })
                .lean();
                
            // Extract the other participant ID from the room ID (format: user1Id_user2Id)
            const participants = room.roomId.split('_');
            const otherParticipantId = participants[0] === userId ? participants[1] : participants[0];
            
            // Get the other participant's details - first try to find a doctor with matching user reference
            let otherParticipant;
            const doctor = await Doctor.findOne({ user: otherParticipantId })
                .select('firstName lastName specialization')
                .lean();
            
            if (doctor) {
                otherParticipant = {
                    name: `${doctor.firstName} ${doctor.lastName}`,
                    specialization: doctor.specialization,
                    userId: otherParticipantId // Use the ID directly from room participants
                };
            } else {
                // If not a doctor, try to find a regular user
                const user = await User.findById(otherParticipantId)
                    .select('name email')
                    .lean();
                
                otherParticipant = user ? {
                    name: user.name,
                    userId: otherParticipantId
                } : { name: 'Unknown User', userId: otherParticipantId };
            }
            
            return {
                roomId: room.roomId,
                otherParticipant,
                lastMessage: latestMessage?.text || '',
                timestamp: latestMessage?.timestamp || new Date(),
                unreadCount: 0 // This would need a more complex query to calculate
            };
        }));
        
        // Sort rooms by latest message timestamp
        roomsWithDetails.sort((a, b) => b.timestamp - a.timestamp);
        
        res.json({
            status: 'success',
            data: roomsWithDetails
        });
    } catch (error) {
        console.error('Error getting chat rooms:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get chat rooms',
            error: error.message
        });
    }
});

// Get messages for a specific chat room
router.get('/messages/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const { limit = 50, before } = req.query;
        
        let query = { roomId };
        if (before) {
            query.timestamp = { $lt: new Date(before) };
        }
        
        const messages = await Message.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .lean();
            
        res.json({
            status: 'success',
            data: messages.reverse() // Return in chronological order
        });
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get messages',
            error: error.message
        });
    }
});

// Create a new chat room (used when starting a new conversation)
router.post('/rooms', async (req, res) => {
    try {
        const { patientId, doctorId, initialMessage } = req.body;
        
        // Log request parameters for debugging
        console.log('Create chat room request:', {
            patientId: patientId,
            doctorId: doctorId,
            initialMessage: initialMessage ? 'provided' : 'not provided'
        });
        
        // Validate required parameters
        if (!patientId || !doctorId) {
            return res.status(400).json({
                status: 'error',
                message: 'Both patientId and doctorId are required'
            });
        }
        
        try {
            // Check if patientId is valid
            if (!mongoose.Types.ObjectId.isValid(patientId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid patient ID format',
                    detail: `Invalid ObjectId format: ${patientId}`
                });
            }
            
            // First, try to find the ID directly as a User ID
            let patient = await User.findById(patientId).select('_id name');
            let actualPatientId = patientId;
            let patientName = '';
            
            // If not found as a User ID, check if it's a Profile ID
            if (!patient) {
                console.log(`No user found directly with ID: ${patientId}, checking if it's a profile ID...`);
                
                // Check if this is a profile ID
                const userProfile = await UserProfile.findById(patientId).select('user firstName lastName').populate('user', '_id name');
                
                if (userProfile && userProfile.user) {
                    console.log(`Found profile with ID: ${patientId}, linked to user: ${userProfile.user._id}`);
                    patient = userProfile.user;
                    actualPatientId = userProfile.user._id.toString();
                    
                    // Use profile name if available, otherwise use the user's name
                    if (userProfile.firstName && userProfile.lastName) {
                        patientName = `${userProfile.firstName} ${userProfile.lastName}`;
                    } else if (patient.name) {
                        patientName = patient.name;
                    } else {
                        patientName = 'Patient';
                    }
                } else {
                    return res.status(404).json({
                        status: 'error',
                        message: 'Patient not found',
                        detail: `No user found with ID: ${patientId}`
                    });
                }
            } else {
                console.log(`Found patient directly: ${patient.name} with ID: ${patient._id}`);
                patientName = patient.name || 'Patient';
                
                // If user found but no name, try to get name from profile
                if (!patientName || patientName === 'Patient') {
                    const userProfile = await UserProfile.findOne({ user: patient._id }).select('firstName lastName');
                    if (userProfile && userProfile.firstName && userProfile.lastName) {
                        patientName = `${userProfile.firstName} ${userProfile.lastName}`;
                    }
                }
            }
            
            // Ensure we have a valid patient name
            if (!patientName) {
                patientName = 'Patient';
                console.log('Using default name "Patient" because no name was found');
            }
            
            // Check for doctor using the User ID reference instead of userId
            const doctor = await Doctor.findOne({ 
                $or: [
                    { user: doctorId },
                    { _id: doctorId }
                ]
            });
            
            if (!doctor) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Doctor not found',
                    detail: `No doctor found with ID: ${doctorId}`
                });
            }
            
            // Get the actual doctor ID (user reference if available, otherwise doctor ID)
            const actualDoctorId = doctor.user ? doctor.user.toString() : doctorId;
            
            // Room ID format: userId1_userId2 (alphabetically sorted to ensure consistency)
            const participants = [actualPatientId, actualDoctorId].sort();
            const roomId = `${participants[0]}_${participants[1]}`;
            
            console.log(`Creating room with ID: ${roomId} (patient: ${actualPatientId}, doctor: ${actualDoctorId})`);
            console.log(`Patient name for message: "${patientName}"`);
            
            // Check if room already exists
            const roomExists = await Message.exists({ roomId });
            
            if (initialMessage) {
                // Save initial message with properly set senderName
                const newMessage = new Message({
                    roomId,
                    senderId: actualPatientId, // Use the actual patient ID
                    senderName: patientName, // Make sure we have a valid sender name
                    text: initialMessage,
                    timestamp: new Date()
                });
                
                await newMessage.save();
                console.log('Initial message saved successfully');
            }
            
            res.status(roomExists ? 200 : 201).json({
                status: 'success',
                data: {
                    roomId,
                    isNewRoom: !roomExists
                }
            });
        } catch (validationError) {
            console.error('Validation error:', validationError);
            return res.status(400).json({
                status: 'error',
                message: 'Invalid ID format',
                detail: validationError.message
            });
        }
    } catch (error) {
        console.error('Error creating chat room:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create chat room',
            error: error.message
        });
    }
});

// Get list of available doctors for chat
router.get('/doctors', async (req, res) => {
    try {
        // Change the query to include firstName, lastName, and user field (which will be used as userId)
        const doctors = await Doctor.find()
            .select('firstName lastName specialization user availability')
            .lean();
            
        // Map the user field to userId for frontend compatibility
        const doctorsWithFullName = doctors.map(doctor => ({
            ...doctor,
            name: `${doctor.firstName} ${doctor.lastName}`,
            userId: doctor.user ? doctor.user.toString() : null // Add userId from user reference
        }));
            
        res.json({
            status: 'success',
            data: doctorsWithFullName
        });
    } catch (error) {
        console.error('Error getting doctors:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get doctors',
            error: error.message
        });
    }
});

// Add a route to check if a user/patient exists - improved to check both user and profile IDs
router.get('/verify-patient/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`Verifying patient with ID: ${userId}`);
        
        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: 'User ID is required'
            });
        }
        
        // Try to validate if this is a proper ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log(`Invalid ObjectId format: ${userId}`);
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user ID format'
            });
        }
        
        // First try to find the ID as a User ID
        let patient = await User.findById(userId).select('_id name');
        let userProfile = null;
        
        // If not found as a User ID, check if it's a Profile ID
        if (!patient) {
            console.log(`No user found directly with ID: ${userId}, checking profiles...`);
            userProfile = await UserProfile.findById(userId).select('_id firstName lastName user').populate('user', '_id name');
            
            if (userProfile && userProfile.user) {
                console.log(`Found profile with ID: ${userId}, linked to user: ${userProfile.user._id}`);
                patient = userProfile.user;
            } else {
                // As a last resort, check if it's a user referenced in a profile
                userProfile = await UserProfile.findOne({ user: userId }).select('_id firstName lastName user').populate('user', '_id name');
                if (userProfile && userProfile.user) {
                    console.log(`Found user referenced in profile: ${userProfile.user._id}`);
                    patient = userProfile.user;
                }
            }
        } else {
            // If found as a User ID, try to get the associated profile
            console.log(`Found user directly: ${patient.name} with ID: ${patient._id}`);
            userProfile = await UserProfile.findOne({ user: userId }).select('_id firstName lastName');
        }
        
        if (!patient) {
            console.log(`No patient found with ID: ${userId}`);
            return res.status(404).json({
                status: 'error',
                message: 'Patient not found',
                detail: `No user found with ID: ${userId}`
            });
        }
        
        // Prepare response with combined user and profile data
        const responseData = {
            userId: patient._id,
            name: patient.name || (userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Unknown'),
            exists: true
        };
        
        if (userProfile) {
            responseData.profileId = userProfile._id;
            responseData.firstName = userProfile.firstName;
            responseData.lastName = userProfile.lastName;
        }
        
        console.log(`Verified patient: ${responseData.name} with ID: ${responseData.userId}`);
        
        return res.status(200).json({
            status: 'success',
            data: responseData
        });
    } catch (error) {
        console.error('Error verifying patient:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to verify patient',
            error: error.message
        });
    }
});

module.exports = router;
