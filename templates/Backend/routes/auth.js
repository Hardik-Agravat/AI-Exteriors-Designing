const express = require('express');
const router = express.Router();
const User = require('../models/user');
const nodemailer = require('nodemailer');
const otpStore = require('../utils/otpStore');

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();
    

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Something went wrong during signup' });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'Wrong email' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
});

// Change Password Route
router.post('/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare old password
    if (user.password !== oldPassword) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Something went wrong during password update' });
  }
});

// Send Email OTP Route
router.post('/send-email-otp', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Your Email Not Register' });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `AI Design <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `<h3>Your OTP is: <b>${otp}</b></h3><p>This OTP is valid for 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// ✅ Verify Email OTP Route
router.post('/verify-email-otp', (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] && otpStore[email].toString() === otp.toString()) {
    delete otpStore[email]; // remove after use
    return res.status(200).json({ message: 'OTP verified successfully' });
  }

  res.status(400).json({ message: 'Invalid or expired OTP' });
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { identifier, newPassword, type } = req.body;

  if (!identifier || !newPassword || !type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    let user;

    if (type === 'email') {
      user = await User.findOne({ email: identifier });
    } else if (type === 'phone') {
      user = await User.findOne({ phone: identifier });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});




module.exports = router;