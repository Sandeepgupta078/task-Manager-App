import Task from '../models/Task.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const STATUSES = ['pending', 'in-progress', 'completed'];

const findOwnTask = async (taskId, userId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  return task;
};

// GET /api/tasks?page=1&limit=20&status=pending
const getTasks = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const filter = { user: req.user._id };
  if (STATUSES.includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-requestId -__v')
      .lean(),
    Task.countDocuments(filter),
  ]);

  res.json({
    tasks,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    total,
  });
});

// GET /api/tasks/:id
const getTask = asyncHandler(async (req, res) => {
  const task = await findOwnTask(req.params.id, req.user._id);
  res.json({ task });
});

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, requestId } = req.body;

  if (!title || !title.trim()) {
    throw new AppError('Title is required', 400);
  }

  try {
    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      status,
      requestId,
    });
    return res.status(201).json({ task });
  } catch (err) {
    // duplicate submit with the same requestId -> hand back the task we already created
    if (err.code === 11000 && requestId) {
      const existing = await Task.findOne({ user: req.user._id, requestId });
      return res.status(200).json({ task: existing });
    }
    throw err;
  }
});

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  // only allow these fields, so nobody can change `user` through the body
  const updates = {};
  ['title', 'description', 'status'].forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (updates.title !== undefined && !String(updates.title).trim()) {
    throw new AppError('Title cannot be empty', 400);
  }

  // description changed -> old AI summary is stale
  if (updates.description !== undefined) {
    updates.summary = '';
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.json({ task });
});

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  res.json({ message: 'Task deleted', id: task._id });
});

export {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  findOwnTask,
};
