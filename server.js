const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/game', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const Leaderboard = require('./models');

// Get leaderboard entries
app.get('/leaderboard', async (req, res) => {
  try {
    const entries = await Leaderboard.find().sort({ score: -1 }).limit(10);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new leaderboard entry
app.post('/leaderboard', async (req, res) => {
  const { name, score } = req.body;
  const newEntry = new Leaderboard({ name, score });

  try {
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});