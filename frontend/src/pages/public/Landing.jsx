import { Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import {
  IconCalendar,
  IconCheck,
  IconChart,
  IconMaterial,
  IconMoney,
  IconQuiz,
} from '../../components/icons.jsx';

const FEATURES = [
  { icon: <IconCalendar />, title: 'Class scheduling', desc: 'Weekly timetable, upcoming sessions and venue changes, all in one calendar view.' },
  { icon: <IconCheck />, title: 'Attendance tracking', desc: 'Mark attendance in seconds and let every student see their own percentage instantly.' },
  { icon: <IconMoney />, title: 'Fee management', desc: 'Track monthly payments, send reminders, and keep a clear record for every student.' },
  { icon: <IconQuiz />, title: 'Quizzes & assessments', desc: 'Auto-graded MCQ quizzes that save you hours of manual marking.' },
  { icon: <IconMaterial />, title: 'Learning materials', desc: 'Upload notes and past papers once — every enrolled student gets instant access.' },
  { icon: <IconChart />, title: 'Progress tracking', desc: "A single chart per student plots every subject's score trend, side by side." },
];

const STEPS = [
  { n: '01', title: 'Teacher sets up the class', desc: 'Mr. Perera creates the schedule, uploads materials, and publishes the first quiz.' },
  { n: '02', title: 'Students join & engage', desc: 'Students log in to check notices, attempt quizzes, and track their own attendance.' },
  { n: '03', title: 'Everyone stays on track', desc: 'Fees, attendance and subject progress are visible at a glance — no spreadsheets.' },
];

function Reveal({ as: Tag = 'div', className = '', children, style }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={style}>
      {children}
    </Tag>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-surface-border bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-ink dark:text-slate-100">TutorHub</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink-secondary dark:text-slate-300 md:flex">
            <a href="#features" className="transition-colors hover:text-brand-dark dark:hover:text-brand">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-brand-dark dark:hover:text-brand">How it works</a>
            <a href="#about" className="transition-colors hover:text-brand-dark dark:hover:text-brand">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-page dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="animate-fade-in-up">
            
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink dark:text-slate-50 sm:text-5xl">
              Run your Combined Maths class like a pro, {' '} 
              <span className="text-brand-dark dark:text-brand">without the spreadsheets</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-secondary dark:text-slate-300">
              TutorHub brings scheduling, attendance, fees, quizzes, materials and progress
              tracking for classes into one simple, friendly dashboard
              built for a tuition teacher and their students.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                Get started
              </Link>
              <a
                href="#how-it-works"
                className="rounded-lg border border-surface-border bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-brand-light dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                See how it works
              </a>
            </div>
            
            {/*
            <div className="mt-10 flex items-center gap-6 text-sm text-ink-secondary dark:text-slate-400">
              <div><span className="font-semibold text-ink dark:text-slate-100">Grade 11</span> Combined Maths</div>
              <div className="h-4 w-px bg-surface-border dark:bg-slate-700" />
              <div><span className="font-semibold text-ink dark:text-slate-100">3</span> subjects tracked</div>
              <div className="h-4 w-px bg-surface-border dark:bg-slate-700" />
              <div><span className="font-semibold text-ink dark:text-slate-100">Rs. 3,500</span> / month</div>
            </div>
            */}
          </div>

          <div className="relative animate-fade-in">
            <img src="/images/hero.jpg" alt="Students in a classroom" className="h-full w-full object-cover rounded-2xl" /> 
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-surface-border bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800 sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-bg text-success-text dark:bg-emerald-900/30 dark:text-emerald-300">
                  <IconCheck />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink dark:text-slate-100">92% attendance</div>
                  <div className="text-xs text-ink-secondary dark:text-slate-400">this month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-ink dark:text-slate-50">Everything a tuition class needs</h2>
            <p className="mt-3 text-ink-secondary dark:text-slate-300">
              One dashboard for the teacher, one for the students built around how a real
              tution class actually runs.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal
                key={f.title}
                className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand-dark dark:bg-brand-dark/20 dark:text-sky-300">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink dark:text-slate-100">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary dark:text-slate-400">{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* About / photo */}
      <section id="about" className="bg-surface-page py-20 dark:bg-slate-800/40">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <img src="/images/about.jpg" alt="Teacher helping a student" className="rounded-2xl object-cover w-full aspect-[4/3]" />
          </Reveal>
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-dark dark:text-brand">About TutorHub</span>
            <h2 className="mt-2 text-3xl font-bold text-ink dark:text-slate-50">
              Built for one teacher who wanted less admin, more teaching
            </h2>
            <p className="mt-4 leading-relaxed text-ink-secondary dark:text-slate-300">
              Mr. Perera has taught Combined Maths for A/L students for years, tracking
              attendance on paper and fees in a notebook. TutorHub replaces that notebook with a
              simple system that students can check themselves fewer questions about "did I
              pay this month?" and "what did I get on the last quiz?", more time for teaching.
            </p>
            <ul className="mt-6 space-y-3">
              {['One login for the teacher, one for every student', 'No spreadsheets, no paper attendance sheets', 'Works on any device, including an older phone'].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink-secondary dark:text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success-bg text-success-text dark:bg-emerald-900/30 dark:text-emerald-300">
                    <IconCheck />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-ink dark:text-slate-50">How it works</h2>
            <p className="mt-3 text-ink-secondary dark:text-slate-300">Three simple steps, no training required.</p>
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} className="relative" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-5xl font-bold text-brand-light dark:text-slate-700">{s.n}</div>
                <h3 className="mt-2 text-lg font-semibold text-ink dark:text-slate-100">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary dark:text-slate-400">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-dark py-16">
        <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Ready to see it in action?</h2>
          <p className="mt-3 text-brand-light">
            Log in with the demo teacher or student account to explore the dashboard.
          </p>
          <Link
            to="/login"
            className="mt-7 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-dark shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Log in to TutorHub
          </Link>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-ink py-10 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold">TH</div>
            <span className="font-semibold">TutorHub</span>
          </div>
          <p className="text-sm text-slate-400">
           Tution Class Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
