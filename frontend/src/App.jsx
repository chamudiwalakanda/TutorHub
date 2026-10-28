import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/public/Landing.jsx';
import Login from './pages/public/Login.jsx';
import StudentMyClasses from './pages/student/MyClasses.jsx';
import BrowseClasses from './pages/student/BrowseClasses.jsx';
import StudentClassDetail from './pages/student/ClassDetail.jsx';
import TeacherMyClasses from './pages/admin/MyClasses.jsx';
import TeacherClassDetail from './pages/admin/ClassDetail.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { IconGrid, IconSearch, IconUsers } from './components/icons.jsx';

const studentLinks = [
  { to: '/dashboard', label: 'My Classes', icon: <IconGrid />, end: true },
  { to: '/dashboard/browse', label: 'Browse Classes', icon: <IconSearch /> },
];

const adminLinks = [
  { to: '/admin', label: 'My Classes', icon: <IconUsers />, end: true },
];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="student">
            <DashboardLayout title="Student panel" heading="Student dashboard" links={studentLinks} />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentMyClasses />} />
        <Route path="browse" element={<BrowseClasses />} />
        <Route path="classes/:classGroupId" element={<StudentClassDetail />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="teacher">
            <DashboardLayout title="Teacher panel" heading="Teacher dashboard" links={adminLinks} />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherMyClasses />} />
        <Route path="classes/:classGroupId" element={<TeacherClassDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
