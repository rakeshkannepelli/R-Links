const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
    
    res.status(201).send({ user: { operatorId: user.operatorId, email: user.email, level: user.level, xp: user.xp, role: user.role, photoUrl: user.photoUrl }, token });
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
    
    res.send({ user: { operatorId: user.operatorId, email: user.email, level: user.level, xp: user.xp, role: user.role, photoUrl: user.photoUrl }, token });
  } catch (error) {
    res.status(400).send();
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Don't leak whether user exists for security reasons
      return res.send({ message: 'If that email is in our database, we will send a password reset link.' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetURL = `${req.body.frontendUrl}/reset-password/${resetToken}`;
    
    // Check if email is configured
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your_gmail')) {
      console.log('\n======================================================');
      console.log('EMAIL NOT CONFIGURED. PRINTING RESET LINK TO CONSOLE:');
      console.log(resetURL);
      console.log('======================================================\n');
      return res.send({ message: 'Development Mode: Reset link printed to server console.' });
    }

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'R-LINKS Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
            `Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n` +
            `${resetURL}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    await transporter.sendMail(mailOptions);
    res.send({ message: 'If that email is in our database, we will send a password reset link.' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error sending email. Please try again.' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({ 
      resetPasswordToken: req.params.token, 
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).send({ error: 'Password reset token is invalid or has expired.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.send({ message: 'Success! Your password has been changed.' });
  } catch (error) {
    res.status(500).send({ error: 'Error resetting password. Please try again.' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  res.send({ user: { operatorId: req.user.operatorId, email: req.user.email, level: req.user.level, xp: req.user.xp, role: req.user.role, photoUrl: req.user.photoUrl } });
});

// Update user profile
router.patch('/me', authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['operatorId', 'username', 'role', 'photoUrl'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    // If frontend sends 'username', map it to 'operatorId' for MongoDB
    if (req.body.username) {
        req.user.operatorId = req.body.username;
        delete req.body.username;
    }
    
    updates.forEach(update => {
        if (update !== 'username') req.user[update] = req.body[update];
    });

    await req.user.save();
    res.send({ user: { operatorId: req.user.operatorId, email: req.user.email, level: req.user.level, xp: req.user.xp, role: req.user.role, photoUrl: req.user.photoUrl } });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
