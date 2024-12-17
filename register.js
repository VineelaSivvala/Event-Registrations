// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/eventRegistration';
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Mongoose schema and model
const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  registrationNumber: { type: Number, required: true, unique: true  },
  rollNumber: { type: String, required: true, unique: true  },
  department: { type: String, required: true },
  event: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Registration = mongoose.model('Registration', registrationSchema);

// Routes

// 1. Register for an event
app.post('/api/register', async (req, res) => {
  const { name, email, event } = req.body;

  if (!name || !email || !event) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newRegistration = new Registration({ name, email, event });
    await newRegistration.save();
    res.status(201).json({ message: 'Registration successful', data: newRegistration });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'This email is already registered for an event' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// 2. Get all registrations
app.get('/api/registrations', async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Get registrations for a specific event
app.get('/api/registrations/:event', async (req, res) => {
  const { event } = req.params;
  try {
    const registrations = await Registration.find({ event });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
