import express from 'express';
import Task from '../models/Task.js';
import { createError } from '../utils/errors.js';

const router = express.Router();

// Get all tasks for authenticated user
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const userId = req.user._id;

    // Build query
    const query = { userId };
    if (category) {
      query.category = category.toLowerCase();
    }

    // Get tasks, limit to 200 for performance
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Create new task
router.post('/', async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user._id;

    // Basic validation
    if (!title || !category) {
      throw createError('Title and category are required', 'MISSING_FIELDS', 400);
    }

    if (title.length > 120) {
      throw createError('Title cannot exceed 120 characters', 'INVALID_TITLE', 400);
    }

    if (description && description.length > 500) {
      throw createError('Description cannot exceed 500 characters', 'INVALID_DESCRIPTION', 400);
    }

    if (category.length > 24) {
      throw createError('Category cannot exceed 24 characters', 'INVALID_CATEGORY', 400);
    }

    // Create task
    const task = new Task({
      userId,
      title: title.trim(),
      description: description?.trim() || '',
      category: category.toLowerCase().trim()
    });

    await task.save();

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// Update task
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // Validate task ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw createError('Invalid task ID', 'INVALID_ID', 400);
    }

    // Find task and verify ownership
    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      throw createError('Task not found', 'TASK_NOT_FOUND', 404);
    }

    // Validate updates
    const allowedUpdates = ['title', 'description', 'category', 'isDone'];
    const updateKeys = Object.keys(updates);
    
    for (const key of updateKeys) {
      if (!allowedUpdates.includes(key)) {
        throw createError(`Field '${key}' is not allowed to be updated`, 'INVALID_FIELD', 400);
      }
    }

    // Validate specific fields
    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        throw createError('Title cannot be empty', 'INVALID_TITLE', 400);
      }
      if (updates.title.length > 120) {
        throw createError('Title cannot exceed 120 characters', 'INVALID_TITLE', 400);
      }
      updates.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      if (updates.description && updates.description.length > 500) {
        throw createError('Description cannot exceed 500 characters', 'INVALID_DESCRIPTION', 400);
      }
      updates.description = updates.description?.trim() || '';
    }

    if (updates.category !== undefined) {
      if (!updates.category.trim()) {
        throw createError('Category cannot be empty', 'INVALID_CATEGORY', 400);
      }
      if (updates.category.length > 24) {
        throw createError('Category cannot exceed 24 characters', 'INVALID_CATEGORY', 400);
      }
      updates.category = updates.category.toLowerCase().trim();
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate task ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw createError('Invalid task ID', 'INVALID_ID', 400);
    }

    // Find and delete task
    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) {
      throw createError('Task not found', 'TASK_NOT_FOUND', 404);
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get user info (optional helpful endpoint)
router.get('/me', async (req, res, next) => {
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

// Get categories with counts (optional helpful endpoint)
router.get('/categories', async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const categories = await Task.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(categories.map(cat => ({
      category: cat._id,
      count: cat.count
    })));
  } catch (error) {
    next(error);
  }
});

export default router;
