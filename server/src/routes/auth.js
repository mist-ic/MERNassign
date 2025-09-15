import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createError } from '../utils/errors.js';
import { authenticateToken } from '../middleware/auth.js';

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

// Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    });
  } catch (error) {
    next(error);
  }
});

// Update current user (basic profile)
router.patch('/me', authenticateToken, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (name === undefined && email === undefined && password === undefined) {
      throw createError('No fields to update', 'NO_FIELDS', 400);
    }

    // Validate name
    if (name !== undefined) {
      if (!name.trim()) {
        throw createError('Name cannot be empty', 'INVALID_NAME', 400);
      }
      if (name.length > 50) {
        throw createError('Name cannot exceed 50 characters', 'INVALID_NAME', 400);
      }
    }

    // Validate email
    if (email !== undefined) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        throw createError('Please enter a valid email', 'INVALID_EMAIL', 400);
      }
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing && existing._id.toString() !== req.user._id.toString()) {
        throw createError('Email already in use', 'DUPLICATE_EMAIL', 409);
      }
    }

    // If updating password, use save() to trigger hashing
    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 6) {
        throw createError('Password must be at least 6 characters', 'INVALID_PASSWORD', 400);
      }
      const user = await User.findById(req.user._id);
      if (!user) {
        throw createError('User not found', 'USER_NOT_FOUND', 404);
      }
      if (name !== undefined) user.name = name.trim();
      if (email !== undefined) user.email = email.toLowerCase().trim();
      user.passwordHash = password;
      await user.save();
      return res.json({ id: user._id, name: user.name, email: user.email });
    }

    // Otherwise update simple fields
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(email !== undefined ? { email: email.toLowerCase().trim() } : {})
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({ id: updated._id, name: updated.name, email: updated.email });
  } catch (error) {
    next(error);
  }
});

export default router;
