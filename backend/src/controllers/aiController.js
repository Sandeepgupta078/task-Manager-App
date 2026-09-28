import { summarizeText } from '../services/aiService.js';
import { findOwnTask } from './taskController.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const MIN_LENGTH = 30;

// POST /api/ai/summary   body: { taskId } or { text }
const generateSummary = asyncHandler(async (req, res) => {
  const { taskId, text } = req.body;

  let task = null;
  let input = text;

  if (taskId) {
    task = await findOwnTask(taskId, req.user._id);
    input = task.description;
  }

  if (!input || input.trim().length < MIN_LENGTH) {
    throw new AppError(`Description is too short to summarize (min ${MIN_LENGTH} characters)`, 400);
  }

  let summary;
  try {
    summary = await summarizeText(input);
  } catch (err) {
    console.error('Summary failed:', err.message);
    throw new AppError('Could not generate summary right now, please try again', 502);
  }

  if (task) {
    task.summary = summary;
    await task.save();
  }

  res.json({ summary });
});

export { generateSummary };
