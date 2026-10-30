<div align="center">

# 🎓 TutorHub

### A Multi-Teacher Tuition Class Management Platform

<p>
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img alt="Express.js" src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p>
  <img alt="JWT Auth" src="https://img.shields.io/badge/Auth-JWT-orange?style=flat-square" />
  <img alt="Vite" src="https://img.shields.io/badge/Bundler-Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="Status" src="https://img.shields.io/badge/status-academic%20project-blue?style=flat-square" />
</p>

*Built for EC4307 — Web Application Development, University of Ruhuna*

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Code Walkthrough Guide](#-code-walkthrough-guide)

---

## 📌 About

Most "tuition class" projects assume one teacher and one class. **TutorHub doesn't.**

Any teacher can register and create their own class subjects, schedule, fee, the
lot and publish it for students to find. Students browse published classes and
request a seat; nothing opens up until the teacher reviews and approves that request.
Once approved, a student gets a full dashboard for that class: quizzes, study
materials, payment history, attendance as marked by the teacher, and a live chart of
their score progress across every subject.

> 💡 It's one login per person, not one login per class, a teacher who owns three
> classes manages all three from a single "My Classes" screen.

## ✨ Features

<table>
<tr>
<td valign="top" width="50%">

**👩‍🏫 For teachers**
- Create unlimited classes (subjects, schedule, fee, grade)
- Publish / unpublish a class at will
- Approve or reject student enrollment requests
- Mark attendance per session
- Generate & track monthly fee payments
- Create, edit and delete quizzes (auto-graded MCQs)
- Upload learning materials per subject
- Post class notices

</td>
<td valign="top" width="50%">

**🧑‍🎓 For students**
- Browse every published class on offer
- Request to enroll track pending/approved/rejected
- See attendance %, marked by the teacher
- Attempt auto-graded MCQ quizzes
- Download learning materials
- View payment history & dues
- A multi-subject **progress chart**, color-coded per subject
- Full dark mode, remembered across visits

</td>
</tr>
</table>

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Database | MongoDB + Mongoose |
| Backend | Node.js, Express.js, JWT auth, bcrypt, Multer |
| Frontend | React 19, Vite, React Router, Tailwind CSS |
| Charts | Recharts (CVD-safe categorical palette) |
| HTTP client | Axios |

<<<<<<< HEAD
## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (check with `node -v`)
- **MongoDB** running locally, OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

<details>
<summary><strong>Installing MongoDB locally (click to expand)</strong></summary>
<br>

- **Windows:** download the MongoDB Community Server installer from
  mongodb.com/try/download/community, install it, and make sure the "MongoDB" service is running
  (it usually starts automatically).
- **macOS:** `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`
- **Linux:** follow the official install guide for your distro at
  mongodb.com/docs/manual/administration/install-on-linux/

Alternatively, skip installing MongoDB entirely and use a free Atlas cluster — just copy
the connection string Atlas gives you into `MONGO_URI` in `backend/.env` below.

</details>

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and check the values — the defaults work for a local MongoDB install:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tutorhub
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Seed the database** with demo data — two teachers, three classes, and a mix of
approved/pending/rejected enrollment requests so you can see the approval workflow
from both sides immediately:

```bash
npm run seed
```

**Start the API server:**

```bash
npm run dev
```

You should see `TutorHub API running on http://localhost:5000`. Leave this running.

### 2. Frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`) in your browser.

=======
>>>>>>> f734c24 (New Read and Update Operations are coded)
## 📁 Project Structure

```
tutorhub-mern/
├── backend/            Express API + MongoDB (Mongoose) — port 5000
│   └── src/
│       ├── models/       Mongoose schemas
│       ├── middleware/   auth + per-class access control
│       ├── controllers/  business logic
│       ├── routes/       Express routers
│       └── seed/         demo-data seeder
├── frontend/           React (Vite) + Tailwind CSS — port 5173
│   └── src/
│       ├── context/       Auth + Theme providers
│       ├── components/    shared UI (cards, charts, badges...)
│       ├── layouts/       dashboard shell
│       └── pages/         public / student / admin pages
└── docs/               erd.mmd (source) + erd.png (rendered)
```

## 🧭 Code Walkthrough Guide

Suggested reading order if you're getting (re)familiar with the codebase:

1. `backend/src/models/` — the data shapes, especially `ClassGroup.js` (a class
   belongs to one teacher, but a teacher can own many) and `Enrollment.js` (the
   pending/approved/rejected link between a student and a class)
2. `backend/src/middleware/classAccess.js` — the access-control core: every
   class-scoped route loads the class by `:classGroupId` in the URL, then checks
   either "are you the teacher who owns this class" or "do you have an approved
   enrollment here"
3. `backend/src/controllers/classGroupController.js` — class creation, browsing,
   publishing, and the enrollment request/approve/reject flow
4. `backend/src/routes/` — everything except auth and `/api/classes` itself is
   nested under `/api/classes/:classGroupId/...` (sessions, attendance, payments,
   quizzes, attempts, materials, notices, stats)
5. `frontend/src/context/AuthContext.jsx` — how login/JWT/role state works
6. `frontend/src/pages/admin/MyClasses.jsx` + `ClassDetail.jsx`, and
   `frontend/src/pages/student/MyClasses.jsx` + `BrowseClasses.jsx` + `ClassDetail.jsx`
   — where everything comes together on screen

