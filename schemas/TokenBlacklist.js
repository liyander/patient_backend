const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '7d' // Automatically remove documents after 7 days
  }
});

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = { TokenBlacklist };
