import rateLimit from 'express-rate-limit';

const limitMessage = (msg) => ({ message: msg });

// general limit for the whole API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: limitMessage('Too many requests, please try again later'),
});

// stricter on login/register to slow down brute force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: limitMessage('Too many login attempts, please try again after 15 minutes'),
});

export { apiLimiter, authLimiter };
