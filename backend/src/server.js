import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import classGroupRoutes from './routes/classGroupRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import attemptRoutes from './routes/attemptRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve('src/uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);

// Class CRUD, browsing, and enrollment requests/approvals.
app.use('/api/classes', classGroupRoutes);

// Every feature below belongs to ONE class, so each is mounted under
// /api/classes/:classGroupId/<resource>. The route files use
// Router({ mergeParams: true }) so they can read :classGroupId themselves.
app.use('/api/classes/:classGroupId/students', studentRoutes);
app.use('/api/classes/:classGroupId/sessions', sessionRoutes);
app.use('/api/classes/:classGroupId/attendance', attendanceRoutes);
app.use('/api/classes/:classGroupId/payments', paymentRoutes);
app.use('/api/classes/:classGroupId/quizzes', quizRoutes);
app.use('/api/classes/:classGroupId/attempts', attemptRoutes);
app.use('/api/classes/:classGroupId/materials', materialRoutes);
app.use('/api/classes/:classGroupId/notices', noticeRoutes);
app.use('/api/classes/:classGroupId/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`TutorHub API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
