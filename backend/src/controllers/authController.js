import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  // frontend and backend live on different domains in production
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000,
};

const sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      user: { id: user._id, name: user.name, email: user.email },
    });
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email and password are required', 400);
  }
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('Email is already registered', 409);
  }

  const user = await User.create({ name, email, password });
  sendToken(user, 201, res);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  sendToken(user, 200, res);
});

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
  res.json({ message: 'Logged out' });
};

// GET /api/auth/me
const getMe = (req, res) => {
  const { _id, name, email } = req.user;
  res.json({ user: { id: _id, name, email } });
};

export { register, login, logout, getMe };
