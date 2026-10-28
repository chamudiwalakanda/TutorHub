import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

import User from '../models/User.js';
import ClassGroup from '../models/ClassGroup.js';
import Enrollment from '../models/Enrollment.js';
import Session from '../models/Session.js';
import Attendance from '../models/Attendance.js';
import Payment from '../models/Payment.js';
import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';
import Notice from '../models/Notice.js';

dotenv.config();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(16, 0, 0, 0);
  return d;
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(16, 0, 0, 0);
  return d;
}
function monthKey(date) {
  return date.toISOString().slice(0, 7);
}

const SUBJECT_SCORES = {
  'Pure Maths': [68, 74, 79, 84, 88],
  'Applied Maths': [58, 62, 66, 70, 74],
  Statistics: [70, 72, 76, 79, 81],
};

/** Creates `count` past sessions plus one "today" and one upcoming session for a class. */
async function createSessions(classGroup, count) {
  const past = [];
  for (let i = count; i >= 1; i -= 1) {
    const session = await Session.create({
      classGroup: classGroup._id,
      date: daysAgo(i * 4),
      topic: 'Combined Maths session',
      status: 'completed',
    });
    past.push(session);
  }
  const today = await Session.create({
    classGroup: classGroup._id,
    date: new Date(),
    topic: "Today's session",
    status: 'upcoming',
  });
  await Session.create({
    classGroup: classGroup._id,
    date: daysFromNow(4),
    topic: 'Upcoming session',
    status: 'upcoming',
  });
  return { past, today };
}

/** Marks attendance for a list of students across the past sessions, at the given rate (0-1). */
async function markAttendanceAtRate(pastSessions, studentId, rate, { lateEvery = 0 } = {}) {
  const presentCount = Math.round(pastSessions.length * rate);
  for (let i = 0; i < pastSessions.length; i += 1) {
    let status = i < presentCount ? 'present' : 'absent';
    if (lateEvery && status === 'present' && i % lateEvery === lateEvery - 1) status = 'late';
    await Attendance.create({ session: pastSessions[i]._id, student: studentId, status });
  }
}

async function createPayment(classGroup, studentId, month, status, { dueDate, paidAt } = {}) {
  await Payment.create({
    student: studentId,
    classGroup: classGroup._id,
    month,
    amount: classGroup.monthlyFee,
    status,
    dueDate: dueDate || new Date(),
    paidAt: paidAt || null,
  });
}

/** The full per-subject quiz history (used for the demo student's progress chart) in one class. */
async function createRichQuizzesWithAttempts(classGroup, demoStudentId) {
  for (const [subject, scores] of Object.entries(SUBJECT_SCORES)) {
    for (let i = 0; i < scores.length; i += 1) {
      const quiz = await Quiz.create({
        classGroup: classGroup._id,
        title: `${subject} - Quiz ${i + 1}`,
        subject,
        order: i + 1,
        dueDate: daysAgo((scores.length - i) * 6),
        durationMinutes: 20,
        published: true,
        questions: [
          { text: `Sample ${subject} question ${i + 1}.1`, options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
          { text: `Sample ${subject} question ${i + 1}.2`, options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
          { text: `Sample ${subject} question ${i + 1}.3`, options: ['A', 'B', 'C', 'D'], correctIndex: 2 },
          { text: `Sample ${subject} question ${i + 1}.4`, options: ['A', 'B', 'C', 'D'], correctIndex: 3 },
        ],
      });
      await Attempt.create({
        quiz: quiz._id,
        student: demoStudentId,
        answers: quiz.questions.map((q) => q.correctIndex), // simplified: seed writes the target score directly
        score: scores[i],
      });
    }
  }
  // one upcoming, not-yet-attempted quiz
  await Quiz.create({
    classGroup: classGroup._id,
    title: 'Calculus - Chapter 4',
    subject: 'Pure Maths',
    order: 6,
    dueDate: daysFromNow(2),
    durationMinutes: 30,
    published: true,
    questions: [
      { text: 'd/dx of x^2 is:', options: ['x', '2x', 'x^2', '2'], correctIndex: 1 },
      { text: 'Integral of 2x dx is:', options: ['x^2 + C', '2x^2 + C', 'x + C', '2 + C'], correctIndex: 0 },
    ],
  });
  // one draft (unpublished) quiz, so the teacher view has something in "Draft" state
  await Quiz.create({
    classGroup: classGroup._id,
    title: 'Mechanics - Forces Recap',
    subject: 'Applied Maths',
    order: 6,
    dueDate: daysFromNow(6),
    durationMinutes: 20,
    published: false,
    questions: [{ text: 'Newton’s second law is F =', options: ['ma', 'mv', 'm/a', 'a/m'], correctIndex: 0 }],
  });
}

/** A lighter quiz set for a newer/smaller class - a couple of quizzes, no attempts yet. */
async function createStarterQuizzes(classGroup, subjects) {
  let order = 1;
  for (const subject of subjects) {
    await Quiz.create({
      classGroup: classGroup._id,
      title: `${subject} - Diagnostic Quiz`,
      subject,
      order: order++,
      dueDate: daysFromNow(5),
      durationMinutes: 20,
      published: true,
      questions: [
        { text: `Sample ${subject} warm-up question 1`, options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
        { text: `Sample ${subject} warm-up question 2`, options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
      ],
    });
  }
}

async function run() {
  await connectDB();
  console.log('Clearing existing TutorHub data...');
  await Promise.all([
    User.deleteMany({}),
    ClassGroup.deleteMany({}),
    Enrollment.deleteMany({}),
    Session.deleteMany({}),
    Attendance.deleteMany({}),
    Payment.deleteMany({}),
    Quiz.deleteMany({}),
    Attempt.deleteMany({}),
    Notice.deleteMany({}),
  ]);

  console.log('Creating teachers...');
  const perera = await User.create({ name: 'Mr. Perera', email: 'teacher@tutorhub.lk', password: 'teacher123', role: 'teacher' });
  const fernando = await User.create({ name: 'Mrs. Fernando', email: 'fernando@tutorhub.lk', password: 'teacher123', role: 'teacher' });

  console.log('Creating classes...');
  const classA = await ClassGroup.create({
    name: 'Grade 11 - Combined Maths',
    teacher: perera._id,
    grade: 'Grade 11',
    subjects: ['Pure Maths', 'Applied Maths', 'Statistics'],
    description: 'Full Combined Maths syllabus for Grade 11, covering Pure Maths, Applied Maths and Statistics.',
    schedule: 'Sat-Sun, 2:00-6:00 PM',
    monthlyFee: 3500,
    maxStudents: 15,
    published: true,
  });
  const classB = await ClassGroup.create({
    name: 'Grade 12 - Combined Maths',
    teacher: perera._id,
    grade: 'Grade 12',
    subjects: ['Pure Maths', 'Applied Maths', 'Statistics'],
    description: 'Grade 12 Combined Maths, building toward the A/L syllabus.',
    schedule: 'Sat, 9:00 AM-12:00 PM',
    monthlyFee: 4000,
    maxStudents: 15,
    published: true,
  });
  const classC = await ClassGroup.create({
    name: 'Grade 10 - Maths Foundation',
    teacher: fernando._id,
    grade: 'Grade 10',
    subjects: ['Pure Maths', 'Statistics'],
    description: 'Foundation class building the basics before Combined Maths starts in Grade 11.',
    schedule: 'Sun, 9:00 AM-12:00 PM',
    monthlyFee: 3000,
    maxStudents: 20,
    published: true,
  });

  console.log('Creating students...');
  const nimal = await User.create({ name: 'Nimal Perera', email: 'student@tutorhub.lk', password: 'student123', role: 'student', grade: 'Grade 11' }); // the demo login
  const ayesha = await User.create({ name: 'Ayesha Fernando', email: 'ayesha@tutorhub.lk', password: 'password123', role: 'student', grade: 'Grade 11' });
  const kavindu = await User.create({ name: 'Kavindu Silva', email: 'kavindu@tutorhub.lk', password: 'password123', role: 'student', grade: 'Grade 11' });
  const dilani = await User.create({ name: 'Dilani Jayasuriya', email: 'dilani@tutorhub.lk', password: 'password123', role: 'student', grade: 'Grade 11' });
  const tharindu = await User.create({ name: 'Tharindu Weerasinghe', email: 'tharindu@tutorhub.lk', password: 'password123', role: 'student', grade: 'Grade 12' });
  const sanduni = await User.create({ name: 'Sanduni Bandara', email: 'sanduni@tutorhub.lk', password: 'password123', role: 'student', grade: 'Grade 10' });
  const ruwan = await User.create({ name: 'Ruwan Kumara', email: 'ruwan@tutorhub.lk', password: 'password123', role: 'student', grade: 'Grade 10' });

  console.log('Creating enrollments (approved / pending / rejected mix, to demo the approval flow)...');
  const now = new Date();
  async function enroll(student, classGroup, status) {
    return Enrollment.create({
      student: student._id,
      classGroup: classGroup._id,
      status,
      requestedAt: now,
      respondedAt: status === 'pending' ? null : now,
    });
  }
  // Class A (Mr. Perera, Grade 11) - the "full" class, matches the original demo
  await enroll(nimal, classA, 'approved');
  await enroll(ayesha, classA, 'approved');
  await enroll(kavindu, classA, 'approved');
  await enroll(dilani, classA, 'approved');
  // Class B (Mr. Perera, Grade 12) - shows a teacher owning a second class
  await enroll(tharindu, classB, 'approved');
  await enroll(nimal, classB, 'pending'); // demo student has a request awaiting approval here
  await enroll(dilani, classB, 'rejected'); // demo student can see a rejected request and re-request
  // Class C (Mrs. Fernando, Grade 10) - shows a second teacher entirely
  await enroll(sanduni, classC, 'approved');
  await enroll(ruwan, classC, 'pending');

  console.log('Creating sessions & attendance for Class A...');
  const { past: pastA } = await createSessions(classA, 25);
  // demo student: 22 present, 1 late, 2 absent -> 23/25 = 92%
  await markAttendanceAtRate(pastA, nimal._id, 0.92, { lateEvery: 22 });
  await markAttendanceAtRate(pastA, ayesha._id, 0.78, {});
  await markAttendanceAtRate(pastA, kavindu._id, 0.97, {});
  await markAttendanceAtRate(pastA, dilani._id, 0.64, {});

  console.log('Creating sessions & attendance for Class B...');
  const { past: pastB } = await createSessions(classB, 10);
  await markAttendanceAtRate(pastB, tharindu._id, 0.85, {});

  console.log('Creating sessions & attendance for Class C...');
  const { past: pastC } = await createSessions(classC, 6);
  await markAttendanceAtRate(pastC, sanduni._id, 0.9, {});

  console.log('Creating quizzes and attempts...');
  await createRichQuizzesWithAttempts(classA, nimal._id);
  await createStarterQuizzes(classB, classB.subjects);
  await createStarterQuizzes(classC, classC.subjects);

  console.log('Creating payments...');
  const thisMonth = monthKey(now);
  const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 15));
  const twoMonthsAgo = monthKey(new Date(now.getFullYear(), now.getMonth() - 2, 15));
  const dueDateThisMonth = new Date(now.getFullYear(), now.getMonth(), 5);

  // Class A payments
  await createPayment(classA, nimal._id, twoMonthsAgo, 'paid', { dueDate: new Date(now.getFullYear(), now.getMonth() - 2, 5), paidAt: new Date(now.getFullYear(), now.getMonth() - 2, 3) });
  await createPayment(classA, nimal._id, lastMonth, 'paid', { dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 5), paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 4) });
  await createPayment(classA, nimal._id, thisMonth, 'due', { dueDate: dueDateThisMonth });
  await createPayment(classA, ayesha._id, thisMonth, 'overdue', { dueDate: dueDateThisMonth });
  await createPayment(classA, kavindu._id, thisMonth, 'paid', { dueDate: dueDateThisMonth, paidAt: new Date() });
  await createPayment(classA, dilani._id, thisMonth, 'due', { dueDate: dueDateThisMonth });

  // Class B payments
  await createPayment(classB, tharindu._id, thisMonth, 'paid', { dueDate: dueDateThisMonth, paidAt: new Date() });

  // Class C payments
  await createPayment(classC, sanduni._id, thisMonth, 'due', { dueDate: dueDateThisMonth });

  console.log('Creating notices...');
  await Notice.create({ classGroup: classA._id, title: 'No class this Friday - public holiday', body: 'There will be no class this Friday due to the public holiday. See you at the usual weekend session.', postedBy: perera._id });
  await Notice.create({ classGroup: classA._id, title: "Bring last term's workbook on Monday", body: "Please bring your term 2 workbook to the next class, we'll be reviewing it before the new syllabus starts.", postedBy: perera._id });
  await Notice.create({ classGroup: classB._id, title: 'Welcome to Grade 12 Combined Maths', body: 'Looking forward to a great year - check the materials section for the term 1 outline.', postedBy: perera._id });
  await Notice.create({ classGroup: classC._id, title: 'Foundation class starts this weekend', body: 'Please bring a scientific calculator and your Grade 9 textbook to the first session.', postedBy: fernando._id });

  console.log('\nSeed complete!\n');
  console.log('Teacher logins:');
  console.log('  Mr. Perera   -> email: teacher@tutorhub.lk   password: teacher123   (owns Class A & Class B)');
  console.log('  Mrs. Fernando-> email: fernando@tutorhub.lk  password: teacher123   (owns Class C)');
  console.log('\nStudent logins:');
  console.log('  Nimal (demo) -> email: student@tutorhub.lk   password: student123   (approved in A, PENDING in B, rejected-then-can-re-request for B)');
  console.log('  Others       -> ayesha / kavindu / dilani / tharindu / sanduni / ruwan @tutorhub.lk, password: password123\n');
  console.log('Log in as Mr. Perera and open Class B, or Mrs. Fernando and open Class C, to see the "Enrollment requests" approval tab in action.\n');

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
