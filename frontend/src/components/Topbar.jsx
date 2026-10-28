import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar({ onMenuClick, heading }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-surface-border bg-white/80 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-ink-secondary hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-ink dark:text-slate-100 sm:text-lg">{heading}</h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="hidden text-right sm:block">
          <div className="text-sm font-medium text-ink dark:text-slate-100">{user?.name}</div>
          <div className="text-xs capitalize text-ink-secondary dark:text-slate-400">{user?.role}</div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className="rounded-md p-2 text-ink-secondary hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
