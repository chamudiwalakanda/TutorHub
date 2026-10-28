import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Wraps a route that requires a logged-in user.
 * Pass `role="teacher"` or `role="student"` to also restrict by role.
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page dark:bg-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/30 border-t-brand" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // Logged in, but as the wrong role — send them to their own dashboard.
    return <Navigate to={user.role === 'teacher' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}
