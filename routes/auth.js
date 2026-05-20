const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Google OAuth Login / Register
router.post('/google', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    // Fetch user profile from Google using the access_token
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    if (!googleRes.ok) {
      throw new Error('Failed to fetch user profile from Google');
    }
    
    const payload = await googleRes.json();
    const { email, name, picture, sub } = payload;
    
    // Check if user already exists in MongoDB
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user automatically!
      // We use the Google ID (sub) as the password hash for safety since they don't have a real password
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = new User({
        operatorId: name.toUpperCase().replace(/\s+/g, '_') + '_' + crypto.randomBytes(2).toString('hex'),
        email,
        password: randomPassword,
        photoUrl: picture
      });
      await user.save();
    } else if (!user.photoUrl && picture) {
      // If user exists but has no photo, update it
      user.photoUrl = picture;
      await user.save();
    }
    
    // Generate our own JWT token for them!
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.send({ user: userResponse, token });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).send({ error: 'Google Authentication failed.' });
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
    
    // Check if email is configured (Fallback to Console)
    if (!process.env.RESEND_API_KEY) {
      console.log('\n======================================================');
      console.log('RESEND_API_KEY NOT CONFIGURED. PRINTING RESET LINK TO CONSOLE:');
      console.log(resetURL);
      console.log('======================================================\n');
      return res.send({ message: 'Development Mode: Reset link printed to server console.' });
    }

    // === NEW HTTP EMAIL SYSTEM (Bypasses Render SMTP Block) ===
    const emailData = {
      from: 'onboarding@resend.dev', // Resend's default free testing email
      to: user.email,
      subject: 'R-LINKS Password Reset',
      html: `<p>You are receiving this because you requested a password reset.</p>
             <p>Please click on the following link to complete the process:</p>
             <p><a href="${resetURL}" style="color: #4CAF50; font-weight: bold;">${resetURL}</a></p>
             <p>If you did not request this, please ignore this email.</p>`
    };

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify(emailData)
    });

    if (!emailResponse.ok) {
      const errData = await emailResponse.text();
      console.error('Email API Error:', errData);
      throw new Error('Failed to send email via HTTP API');
    }
    
    res.send({ message: 'If that email is in our database, we will send a password reset link.' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: `Error sending email: ${error.message}` });
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
