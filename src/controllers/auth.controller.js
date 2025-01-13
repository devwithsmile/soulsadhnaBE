import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import User from '../models/user.model.js';
import validator from 'validator';
import { sendTemplatedEmail } from '../utils/emailUtils.js';
import config from '../config/config.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);


const VALID_ROLES = ['admin', 'user'];
export const register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body); // Log request body

    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'Please provide email, password and name',
        received: { email, password: '***', name }
      });
    }

    console.log('Checking for existing user...'); // Log step
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Hashing password...'); // Log step
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Creating user...'); // Log step
    const user = await User.create({
      email,
      password: hashedPassword,
      name
    });

    console.log('Generating token...'); // Log step
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Registration successful'); // Log success
    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = (role) => async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sanitize email
    email = validator.normalizeEmail(email);

    // Validate email and password
    if (!validator.isEmail(email) || validator.isEmpty(password)) {
      return res.status(400).json({ global: 'Invalid email or password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role !== role) {
      return res
        .status(403)
        .json({ global: `Access denied. User is not a ${role}.` });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};

export const googleAuth = (role) => async (req, res) => {
  try {
    const { code } = req.body;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = await User.create({
        email: data.email,
        name: data.name,
        googleId: data.id,
        role: role,
        password: await bcrypt.hash(Math.random().toString(36), 10)
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send email with reset link (implement email service)
    // Send the reset email with the JWT token
    const resetLink = `${config.GENERAL_CONFIG.REDIRECT_URL}/resetpassword?token=${resetToken}`;
    await sendTemplatedEmail(email, 'passwordReset', {
      userName: user?.full_name || email.split('@')[0],
      resetLink,
    });

    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process request' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    // Validate input fields
    if (validator.isEmpty(newPasswordrd)) {
      return res.status(400).json({
        errors: {
          global: 'New password is required.',
        },
      });
    }

    // Validate token
    if (validator.isEmpty(token)) {
      return res.status(400).json({
        errors: {
          global: 'Reset token is required.',
        },
      });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};