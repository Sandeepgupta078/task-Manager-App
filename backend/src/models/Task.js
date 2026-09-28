import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    summary: {
      type: String,
      default: '',
    },
    // sent by the client with every create request, used to ignore double submits
    requestId: {
      type: String,
    },
  },
  { timestamps: true }
);

// most queries are "tasks of this user, newest first"
taskSchema.index({ user: 1, createdAt: -1 });

// same requestId from the same user can only create one task
taskSchema.index(
  { user: 1, requestId: 1 },
  { unique: true, partialFilterExpression: { requestId: { $type: 'string' } } }
);

export default mongoose.model('Task', taskSchema);
