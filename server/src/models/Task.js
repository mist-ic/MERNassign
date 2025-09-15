import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true,
    maxlength: [24, 'Category cannot exceed 24 characters'],
    match: [/^[a-z0-9\s-]+$/, 'Category can only contain lowercase letters, numbers, spaces, and hyphens']
  },
  isDone: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
taskSchema.index({ userId: 1, category: 1, isDone: 1, createdAt: -1 });

export default mongoose.model('Task', taskSchema);
