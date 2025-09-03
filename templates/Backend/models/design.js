const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  prompt: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Design', designSchema);
