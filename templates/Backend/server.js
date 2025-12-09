// server.js (Entry point)
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Log environment status
console.log('🔑 Environment check:');
console.log('   - .env file location:', path.join(__dirname, '.env'));
console.log('   - OPENAI_API_KEY loaded:', process.env.OPENAI_API_KEY ? '✅ Yes' : '❌ No');
console.log('   - MONGO_URI loaded:', process.env.MONGO_URI ? '✅ Yes' : '❌ No');
console.log('   - PORT:', process.env.PORT || 5000);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_design_db')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const designRoutes = require('./routes/design');



app.use('/api/auth', authRoutes);
app.use('/api/design', designRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
