import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import User from '../models/user.model.js';
import validator from 'validator';
import { sendTemplatedEmail } from '../utils/emailUtils.js';
import config from '../config/config.js';
import crypto from 'crypto';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);


const VALID_ROLES = ['admin', 'user'];

// Add password validation helper
const isPasswordValid = (password) => {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
};

export const register = async (req, res) => {
  try {
    console.log(" inside register");
    const { email, password, name } = req.body;

    // Sanitize the email input
    const sanitizedEmail = validator.normalizeEmail(email);


    // Enhanced input validation
    if (!sanitizedEmail || !password || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email, password and name'
      });
    }

    if (!validator.isEmail(sanitizedEmail)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }
    console.log(" email", sanitizedEmail, "password", password, "name", name);
    if (!isPasswordValid(password)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'
      });
    }

    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: sanitizedEmail,
      password: hashedPassword,
      name
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log(" token", token);
    await sendTemplatedEmail(sanitizedEmail, 'welcome', {
      userName: name || email.split('@')[0] || email,
    });

    res.status(201).json({ token });
  } catch (error) {
    // Improved error handling
    const errorResponse = {
      status: 'error',
      message: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
    console.log(" errorResponse", errorResponse);
    res.status(500).json(errorResponse);
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;


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

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        status: 'error',
        message: 'Authorization code is required'
      });
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
    } catch (tokenError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired authorization code. Please try logging in again.',
        details: process.env.NODE_ENV === 'development' ? 'Authorization code can only be used once and expires quickly' : undefined
      });
    }

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Validate required Google data
    if (!data.email || !data.id) {
      throw new Error('Incomplete user data received from Google');
    }

    // First try to find user by googleId
    let user = await User.findOne({ googleId: data.id });

    // If not found by googleId, try email
    if (!user) {
      user = await User.findOne({ email: data.email });

      if (user) {
        // If user exists with email but no googleId, link the accounts
        user.googleId = data.id;
        await user.save();
      } else {
        // Create new user with a strong random password
        const randomPassword = crypto.randomBytes(32).toString('hex');
        user = await User.create({
          email: data.email,
          name: data.name || data.email.split('@')[0],
          googleId: data.id,
          password: await bcrypt.hash(randomPassword, 12)
        });
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      token
    });
  } catch (error) {
    console.error('Google authentication error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Google authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    // Normalize email before searching
    const normalizedEmail = validator.normalizeEmail(email);

    // Simulate consistent processing time to prevent timing attacks
    const [user] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      new Promise(resolve => setTimeout(resolve, 100)) // Add consistent delay
    ]);

    // Always create a token (even if user doesn't exist) to ensure consistent timing
    const resetToken = jwt.sign(
      {
        id: user?._id || 'dummy-id',
        type: 'password_reset'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    if (user) {
      const resetLink = `${config.GENERAL_CONFIG.REDIRECT_URL}/reset-password?token=${resetToken}`;

      await sendTemplatedEmail(normalizedEmail, 'passwordReset', {
        userName: user.name || user.full_name || email.split('@')[0],
        resetLink,
        expiryTime: '1 hour'
      });
    }

    // Same response whether user exists or not
    res.status(200).json({
      message: 'If a user with this email exists, they will receive password reset instructions.'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword, token } = req.body;

    // Enhanced password validation
    if (!isPasswordValid(newPassword)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'
      });
    }

    // Verify token type
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token type'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be different from the current password'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    // Consistent error response
    const errorResponse = {
      status: 'error',
      message: 'Password reset failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
    res.status(500).json(errorResponse);
  }
};
