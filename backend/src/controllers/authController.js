import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

function sanitize(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    grade: user.grade,
  };
}

// POST /api/auth/register
// Just creates the account. A teacher then creates their own class(es) via
// POST /api/classes; a student browses published classes (GET /api/classes/published)
// and requests a seat in each one they want (POST /api/classes/:id/enroll).
export async function register(req, res) {
  const { name, email, password, role, grade } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password and role are required' });
  }
  if (!['teacher', 'student'].includes(role)) {
    return res.status(400).json({ message: 'role must be teacher or student' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    grade: role === 'student' ? grade || null : null,
  });

  const token = generateToken(user);
  res.status(201).json({ token, user: sanitize(user) });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (role && user.role !== role) {
    return res.status(401).json({ message: `This account is not registered as a ${role}` });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user);
  res.json({ token, user: sanitize(user) });
}

// GET /api/auth/me
export async function me(req, res) {
  res.json({ user: sanitize(req.user) });
}
