import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import PhotoPlaceholder from '../../components/PhotoPlaceholder.jsx';

const DEMO = {
  teacher: { email: 'teacher@tutorhub.lk', password: 'teacher123' },
  student: { email: 'student@tutorhub.lk', password: 'student123' },
};

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name: '', email: '', password: '', grade: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function fillDemo() {
    setForm((f) => ({ ...f, email: DEMO[role].email, password: DEMO[role].password }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login({ email: form.email, password: form.password, role });
      } else {
        user = await register({ name: form.name, email: form.email, password: form.password, role, grade: form.grade });
      }
      const from = location.state?.from?.pathname;
      navigate(from || (user.role === 'teacher' ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Photo side */}
      <div className="relative hidden lg:block">
        {/* Replace with: <img src="/images/login.jpg" alt="Classroom" className="h-full w-full object-cover" /> */}
        <PhotoPlaceholder label="Classroom photo" className="h-full w-full rounded-none" />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-10">
          <h2 className="text-2xl font-bold text-white">Welcome back to TutorHub</h2>
          <p className="mt-2 max-w-sm text-sm text-white/80">
            Grade 11 Combined Maths — attendance, quizzes, materials and fees, all in one place.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col justify-center bg-white px-6 py-12 dark:bg-slate-900 sm:px-10 lg:px-16">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">TH</div>
            <span className="text-lg font-semibold text-ink dark:text-slate-100">TutorHub</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-bold text-ink dark:text-slate-50">
            {mode === 'login' ? 'Log in to your account' : 'Create an account'}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary dark:text-slate-400">
            {mode === 'login' ? "Enter your details to access your dashboard." : 'Students only — your teacher adds you to the class automatically.'}
          </p>

          {/* Role toggle */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-surface-page p-1 dark:bg-slate-800">
            {['student', 'teacher'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-md py-2 text-sm font-medium capitalize transition-colors ${
                  role === r
                    ? 'bg-white text-brand-dark shadow-sm dark:bg-slate-700 dark:text-sky-300'
                    : 'text-ink-secondary hover:text-ink dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-ink dark:text-slate-200">Full name</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-surface-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Nimal Perera"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink dark:text-slate-200">Email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-surface-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink dark:text-slate-200">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-surface-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="••••••••"
              />
            </div>

            {mode === 'register' && role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-ink dark:text-slate-200">Grade</label>
                <select
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-surface-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Select grade</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                  <option value="13">Grade 13</option>
                </select>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger-text dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <button
            type="button"
            onClick={fillDemo}
            className="mt-4 w-full rounded-lg border border-dashed border-surface-border px-4 py-2 text-xs font-medium text-ink-secondary transition-colors hover:border-brand hover:text-brand-dark dark:border-slate-700 dark:text-slate-400 dark:hover:text-sky-300"
          >
            Fill demo {role} credentials
          </button>

          <p className="mt-6 text-center text-sm text-ink-secondary dark:text-slate-400">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => setMode('register')} className="font-semibold text-brand-dark hover:underline dark:text-brand">
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="font-semibold text-brand-dark hover:underline dark:text-brand">
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
