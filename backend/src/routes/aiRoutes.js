import express from 'express';
import rateLimit from 'express-rate-limit';
import { generateSummary } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// AI calls cost money, keep them limited per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many summary requests, wait a minute and try again' },
});

router.post('/summary', protect, aiLimiter, generateSummary);

export default router;
