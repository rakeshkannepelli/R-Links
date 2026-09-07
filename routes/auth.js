const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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
    const identifier = (req.body.email || req.body.operatorId || '').trim();
    const password = req.body.password;
    
    if (!identifier || !password) {
      return res.status(400).send({ error: 'Please enter both login identifier and password.' });
    }

    // Match either email (case-insensitive) OR operatorId (case-insensitive)
    const escapedIdentifier = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { operatorId: new RegExp(`^${escapedIdentifier}$`, 'i') }
      ]
    });
    
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
    res.status(400).send({ error: error.message || 'Login failed' });
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

// GitHub OAuth Login / Register
router.post('/github', async (req, res) => {
  try {
    const { code } = req.body;
    
    // 1. Exchange the code for an access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    
    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'GitHub OAuth failed');
    }
    
    const access_token = tokenData.access_token;

    // 2. Fetch user profile from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 
        'Authorization': `token ${access_token}`,
        'User-Agent': 'R-Links-App'
      }
    });
    const githubUser = await userResponse.json();

    // 3. GitHub hides emails by default, so we must fetch them separately
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: { 
        'Authorization': `token ${access_token}`,
        'User-Agent': 'R-Links-App'
      }
    });
    const emails = await emailResponse.json();
    const primaryEmailObj = emails.find(e => e.primary) || emails[0];
    
    if (!primaryEmailObj) throw new Error('No email found in GitHub account');
    
    const email = primaryEmailObj.email;
    const name = githubUser.name || githubUser.login;
    const picture = githubUser.avatar_url;

    // 4. Check if user already exists in MongoDB
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user automatically!
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = new User({
        operatorId: name.toUpperCase().replace(/[^a-zA-Z0-9]/g, '_') + '_' + crypto.randomBytes(2).toString('hex'),
        email,
        password: randomPassword,
        photoUrl: picture
      });
      await user.save();
    } else if (!user.photoUrl && picture) {
      user.photoUrl = picture;
      await user.save();
    }
    
    // 5. Generate our own JWT token!
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    const userDoc = user.toObject();
    delete userDoc.password;
    
    res.send({ user: userDoc, token });
  } catch (error) {
    console.error('GitHub Auth Error:', error);
    res.status(401).send({ error: 'GitHub Authentication failed.' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const rawEmail = (req.body.email || '').trim().toLowerCase();
    if (!rawEmail) {
      return res.status(400).send({ error: 'Please provide a valid email address.' });
    }

    const user = await User.findOne({ email: rawEmail });
    if (!user) {
      // Don't leak whether user exists for security reasons
      return res.send({ message: 'If that email is in our database, we will send a password reset link.' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const frontendBase = (req.body.frontendUrl || 'http://localhost:5173').replace(/\/$/, '');
    const resetURL = `${frontendBase}/reset-password/${resetToken}`;
    
    let emailDelivered = false;

    // 1. Try Nodemailer if EMAIL_USER and EMAIL_PASS are set
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"R-LINKS Security" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: '🔐 R-LINKS Password Reset Request',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #fbf9f0; color: #1b1c17; border: 2px solid #5f5e5e; border-radius: 12px;">
              <h2 style="color: #006d41; margin-top: 0; font-family: monospace;">RLINKS // VAULT ACCESS RECOVERY</h2>
              <p>You requested to reset your passphrase for operator account <strong>${user.operatorId}</strong> (${user.email}).</p>
              <div style="margin: 24px 0;">
                <a href="${resetURL}" style="background: #1b1c17; color: #00f99b; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 3px 3px 0 #006d41;">RESET PASSPHRASE &rarr;</a>
              </div>
              <p style="font-size: 12px; color: #5f5e5e;">Or copy this link into your browser:<br/><a href="${resetURL}" style="color: #0059c6;">${resetURL}</a></p>
              <p style="font-size: 11px; color: #888; margin-top: 20px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
            </div>
          `
        });
        emailDelivered = true;
      } catch (nmErr) {
        console.error('Nodemailer SMTP attempt error:', nmErr.message);
      }
    }

    // 2. Try Resend if Nodemailer didn't send and RESEND_API_KEY is available
    if (!emailDelivered && process.env.RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: user.email,
            subject: 'R-LINKS Password Reset',
            html: `<p>Password reset link: <a href="${resetURL}">${resetURL}</a></p>`
          })
        });
        if (emailResponse.ok) emailDelivered = true;
      } catch (rsErr) {
        console.error('Resend API attempt error:', rsErr.message);
      }
    }

    // Always log reset link for safety & local dev
    console.log('\n======================================================');
    console.log('RESET LINK FOR:', user.email);
    console.log(resetURL);
    console.log('STATUS:', emailDelivered ? 'EMAIL SENT SUCCESSFULLY' : 'SAVED TO CONSOLE');
    console.log('======================================================\n');

    res.send({ 
      message: 'Password reset link sent! Check your inbox.',
      resetLink: process.env.NODE_ENV !== 'production' ? resetURL : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).send({ error: `Error processing password reset: ${error.message}` });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.trim().length < 4) {
      return res.status(400).send({ error: 'Password must be at least 4 characters.' });
    }

    const user = await User.findOne({ 
      resetPasswordToken: req.params.token, 
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).send({ error: 'Password reset token is invalid or has expired.' });
    }

    user.password = password.trim();
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
