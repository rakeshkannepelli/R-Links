const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = new express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { operatorId, email, password } = req.body;
    
    // Check if operator ID or email already exists
    const existingUser = await User.findOne({ $or: [{ operatorId }, { email }] });
    if (existingUser) {
      return res.status(400).send({ error: 'Operator ID or Email already taken.' });
    }

    const user = new User({ operatorId, email, password });
    await user.save();
    
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).send({ user: { operatorId: user.operatorId, email: user.email, level: user.level, xp: user.xp }, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).send({ error: 'Unable to login. Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Unable to login. Invalid credentials.' });
    }

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.send({ user: { operatorId: user.operatorId, email: user.email, level: user.level, xp: user.xp }, token });
  } catch (error) {
    res.status(400).send();
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  res.send({ user: { operatorId: req.user.operatorId, email: req.user.email, level: req.user.level, xp: req.user.xp } });
});

module.exports = router;
