const Message = require('../schemas/Message');
const Medication = require('../schemas/Medication');

/**
 * Socket.IO event handlers
 * @param {Object} io - Socket.IO server instance
 */
module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('join_room', (data) => {
            socket.join(data.roomId);
            console.log(`Client joined room: ${data.roomId}`);
            
            // Send chat history
            Message.find({ roomId: data.roomId })
                .sort({ timestamp: 1 })
                .then(messages => {
                    socket.emit('chat_history', messages);
                });
        });

        socket.on('chat_message', async (data) => {
            try {
                console.log('\n=== New Message Received ===');
                console.log('Room ID:', data.roomId);
                console.log('Sender ID:', data.senderId);
                console.log('Sender Name:', data.senderName);
                console.log('Message:', data.text);
                console.log('Full Data:', JSON.stringify(data, null, 2));
                console.log('===========================\n');
                
                // Create message object with proper structure
                const messageData = {
                    roomId: data.roomId,
                    senderId: data.senderId,
                    senderName: data.senderName,
                    text: data.text,
                    timestamp: new Date()
                };

                // Save message to database
                const newMessage = new Message(messageData);
                const savedMessage = await newMessage.save();
                console.log('Message saved:', savedMessage);

                // Broadcast the saved message to room
                io.to(data.roomId).emit('chat_message', savedMessage);
            } catch (error) {
                console.error('Error handling message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        socket.on('medication_prescribed', async (data) => {
            try {
                console.log('\n=== New Medication Prescribed ===');
                console.log('Name:', data.name);
                console.log('Dosage:', data.dosage);
                console.log('Frequency:', data.frequency);
                console.log('Duration:', data.duration);
                console.log('Patient ID:', data.patientId);
                console.log('Doctor ID:', data.doctorId);
                console.log('Full Data:', JSON.stringify(data, null, 2));
                console.log('===============================\n');
                
                const medication = new Medication({
                    name: data.name,
                    dosage: data.dosage,
                    frequency: data.frequency,
                    duration: data.duration,
                    patientId: data.patientId,
                    doctorId: data.doctorId
                });
                
                const savedMedication = await medication.save();
                
                io.to(data.roomId).emit('medication_update', savedMedication);
            } catch (error) {
                console.error('Error saving medication:', error);
                socket.emit('error', { message: 'Failed to save medication' });
            }
        });
        
        // Handle new exercise recommendation notifications
        socket.on('newExerciseRecommendation', (recommendation) => {
            if (recommendation && recommendation.patientId) {
                io.to(recommendation.patientId).emit('newExerciseRecommendation', recommendation);
            }
        });
    });
};