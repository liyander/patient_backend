const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, 'app.log');

const logger = {
    log: (type, message, data = null) => {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            type,
            message,
            data
        };
        
        // Append to log file
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
        
        // Also console log for development
        console.log(`[${timestamp}] ${type}: ${message}`);
        if (data) {
            console.log('Data:', data);
        }
    },

    info: (message, data = null) => {
        logger.log('INFO', message, data);
    },

    error: (message, error = null) => {
        logger.log('ERROR', message, error?.stack || error);
    },

    debug: (message, data = null) => {
        logger.log('DEBUG', message, data);
    }
};

module.exports = logger;
