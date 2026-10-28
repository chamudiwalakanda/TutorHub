import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axiosClient.js';
import StatCard from '../../components/StatCard.jsx';
import Badge from '../../components/Badge.jsx';
import ProgressChart from '../../components/ProgressChart.jsx';
import AttendanceRing from '../../components/AttendanceRing.jsx';
import PhotoPlaceholder from '../../components/PhotoPlaceholder.jsx';
import { IconArrowLeft, IconBell, IconCheck, IconClock, IconMaterial, IconMoney, IconQuiz } from '../../components/icons.jsx';

function paymentTone(status) {
  if (status === 'paid') return 'success';
  if (status === 'overdue') return 'danger';
  return 'warning';
}

/** Turns { "Pure Maths": [{order,title,score}], ... } into recharts rows. */
function buildChartRows(progress) {
  const subjects = Object.keys(progress);
  const maxLen = Math.max(0, ...subjects.map((s) => progress[s].length));
  const rows = [];
  for (let i = 0; i < maxLen; i += 1) {
    const row = { assessment: `Test ${i + 1}` };
    subjects.forEach((subject) => {
      const point = progress[subject][i];
      if (point) row[subject] = point.score;
    });
    rows.push(row);
  }
  return { rows, subjects };
}

export default function ClassDetail() {
  const { classGroupId } = useParams();
  const base = `/classes/${classGroupId}`;

  const [classInfo, setClassInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [notices, setNotices] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [payments, setPayments] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [classRes, statsRes, attRes, noticesRes, quizzesRes, materialsRes, paymentsRes, progressRes] =
          await Promise.all([
            api.get(base),
            api.get(`${base}/stats/student`),
            api.get(`${base}/attendance/me`),
            api.get(`${base}/notices`),
            api.get(`${base}/quizzes`),
            api.get(`${base}/materials`),
            api.get(`${base}/payments/me`),
            api.get(`${base}/attempts/me/progress`),
          ]);
        if (cancelled) return;
        setClassInfo(classRes.data);
        setStats(statsRes.data);
        setAttendance(attRes.data);
        setNotices(noticesRes.data);
        setQuizzes(quizzesRes.data);
        setMaterials(materialsRes.data);
        setPayments(paymentsRes.data);
        setProgress(progressRes.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load this class. Is the backend running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [classGroupId]);

  const { rows: chartRows, subjects } = useMemo(() => buildChartRows(progress), [progress]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-ink-secondary dark:text-slate-400">Loading class…</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark hover:underline dark:text-brand">
          <IconArrowLeft /> Back to my classes
        </Link>
        <div className="rounded-xl bg-danger-bg p-4 text-sm text-danger-text dark:bg-red-900/30 dark:text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark hover:underline dark:text-brand">
        <IconArrowLeft /> Back to my classes
      </Link>

      {classInfo && (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {/* Replace with: <img src="/images/your-class-cover.jpg" className="h-40 w-full object-cover" /> */}
          <PhotoPlaceholder label="Class cover photo" className="h-40 w-full" rounded="rounded-none" />
          <div className="p-5">
            <h2 className="text-xl font-semibold text-ink dark:text-slate-50">{classInfo.name}</h2>
            <p className="text-sm text-ink-secondary dark:text-slate-400">Taught by {classInfo.teacherName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-secondary dark:text-slate-400">
              <span className="flex items-center gap-1"><IconClock /> {classInfo.schedule}</span>
              <span>Rs. {classInfo.monthlyFee} / month</span>
            </div>
            {classInfo.subjects?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {classInfo.subjects.map((s) => (
                  <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-ink-secondary dark:bg-slate-700 dark:text-slate-300">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance" value={`${stats?.attendancePct ?? 0}%`} icon={<IconCheck />} tone="success" hint="In this class" />
        <StatCard
          label="This month's fee"
          value={stats?.feeDue ? `Rs. ${stats.feeDue.amount}` : '—'}
          icon={<IconMoney />}
          tone="amber"
          hint={stats?.feeDue ? stats.feeDue.status : 'No record yet'}
        />
        <StatCard label="Upcoming quizzes" value={stats?.upcomingQuizCount ?? 0} icon={<IconQuiz />} tone="brand" hint={stats?.nextQuiz ? stats.nextQuiz.title : 'Nothing due yet'} />
        <StatCard label="Study materials" value={materials.length} icon={<IconMaterial />} tone="brand" hint="Available to you" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress chart */}
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
          <h3 className="text-base font-semibold text-ink dark:text-slate-100">Subject progress</h3>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-slate-400">Your score trend across every quiz, by subject, in this class.</p>
          {subjects.length === 0 ? (
            <p className="mt-6 text-sm text-ink-secondary dark:text-slate-400">No quiz attempts yet — once you attempt a quiz, your progress will appear here.</p>
          ) : (
            <div className="mt-2">
              <ProgressChart data={chartRows} subjects={subjects} />
            </div>
          )}
        </div>

        {/* Attendance ring */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="self-start text-base font-semibold text-ink dark:text-slate-100">Attendance</h3>
          <div className="mt-4">
            <AttendanceRing percentage={attendance?.summary?.pct ?? 0} />
          </div>
          <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-semibold text-ink dark:text-slate-100">{attendance?.summary?.present ?? 0}</div>
              <div className="text-ink-secondary dark:text-slate-400">Present</div>
            </div>
            <div>
              <div className="font-semibold text-ink dark:text-slate-100">{attendance?.summary?.late ?? 0}</div>
              <div className="text-ink-secondary dark:text-slate-400">Late</div>
            </div>
            <div>
              <div className="font-semibold text-ink dark:text-slate-100">{attendance?.summary?.absent ?? 0}</div>
              <div className="text-ink-secondary dark:text-slate-400">Absent</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notices */}
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <IconBell />
            <h3 className="text-base font-semibold text-ink dark:text-slate-100">Class notices</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {notices.length === 0 && <li className="text-sm text-ink-secondary dark:text-slate-400">No notices yet.</li>}
            {notices.slice(0, 5).map((n) => (
              <li key={n._id} className="border-b border-surface-border pb-3 last:border-0 last:pb-0 dark:border-slate-700">
                <div className="text-sm font-medium text-ink dark:text-slate-100">{n.title}</div>
                <div className="mt-0.5 text-sm text-ink-secondary dark:text-slate-400">{n.body}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quizzes */}
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-base font-semibold text-ink dark:text-slate-100">Quizzes</h3>
          <ul className="mt-4 space-y-3">
            {quizzes.length === 0 && <li className="text-sm text-ink-secondary dark:text-slate-400">No quizzes published yet.</li>}
            {quizzes.slice(0, 5).map((q) => (
              <li key={q._id} className="flex items-center justify-between gap-2 border-b border-surface-border pb-3 last:border-0 last:pb-0 dark:border-slate-700">
                <div>
                  <div className="text-sm font-medium text-ink dark:text-slate-100">{q.title}</div>
                  <div className="text-xs text-ink-secondary dark:text-slate-400">{q.subject} · due {new Date(q.dueDate).toLocaleDateString()}</div>
                </div>
                <Badge tone={q.attempted ? 'success' : 'brand'}>{q.attempted ? 'Done' : 'Open'}</Badge>
              </li>
            ))}
          </ul>
        </div>

        {/* Materials */}
        <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-base font-semibold text-ink dark:text-slate-100">Learning materials</h3>
          <ul className="mt-4 space-y-3">
            {materials.length === 0 && <li className="text-sm text-ink-secondary dark:text-slate-400">No materials uploaded yet.</li>}
            {materials.slice(0, 5).map((m) => (
              <li key={m._id} className="flex items-center justify-between gap-2 border-b border-surface-border pb-3 last:border-0 last:pb-0 dark:border-slate-700">
                <div>
                  <div className="text-sm font-medium text-ink dark:text-slate-100">{m.title}</div>
                  <div className="text-xs text-ink-secondary dark:text-slate-400">{m.subject}</div>
                </div>
                <a
                  href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${m.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand-dark hover:underline dark:text-brand"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Payments table */}
      <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-base font-semibold text-ink dark:text-slate-100">Payment history</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-secondary dark:border-slate-700 dark:text-slate-400">
                <th className="py-2 pr-4">Month</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Due date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-ink-secondary dark:text-slate-400">No payment records yet.</td></tr>
              )}
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-surface-border last:border-0 dark:border-slate-700">
                  <td className="py-3 pr-4 text-ink dark:text-slate-100">{p.month}</td>
                  <td className="py-3 pr-4 text-ink dark:text-slate-100">Rs. {p.amount}</td>
                  <td className="py-3 pr-4"><Badge tone={paymentTone(p.status)}>{p.status}</Badge></td>
                  <td className="py-3 text-ink-secondary dark:text-slate-400">{new Date(p.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
