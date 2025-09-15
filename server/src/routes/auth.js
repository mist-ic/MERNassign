import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createError } from '../utils/errors.js';

const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      throw createError('Name, email, and password are required', 'MISSING_FIELDS', 400);
    }

    if (password.length < 6) {
      throw createError('Password must be at least 6 characters', 'INVALID_PASSWORD', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError('Email already registered', 'DUPLICATE_EMAIL', 409);
    }

    // Create user
    const user = new User({
      name,
      email,
      passwordHash: password // Will be hashed by pre-save middleware
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      throw createError('Email and password are required', 'MISSING_FIELDS', 400);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw createError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
