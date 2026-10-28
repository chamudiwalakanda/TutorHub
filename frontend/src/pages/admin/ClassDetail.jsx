import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axiosClient.js';
import StatCard from '../../components/StatCard.jsx';
import Badge from '../../components/Badge.jsx';
import PhotoPlaceholder from '../../components/PhotoPlaceholder.jsx';
import {
  IconArrowLeft, IconBell, IconCalendar, IconCheck, IconClock, IconMaterial, IconMoney, IconQuiz, IconUsers, IconX,
} from '../../components/icons.jsx';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'requests', label: 'Requests' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'fees', label: 'Fees' },
  { id: 'quizzes', label: 'Quizzes' },
  { id: 'materials', label: 'Materials' },
  { id: 'notices', label: 'Notices' },
];

function paymentTone(status) {
  if (status === 'paid') return 'success';
  if (status === 'overdue') return 'danger';
  return 'warning';
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ClassDetail() {
  const { classGroupId } = useParams();
  const base = `/classes/${classGroupId}`;
  const [tab, setTab] = useState('overview');
  const [classInfo, setClassInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState('');

  async function loadHeader() {
    const [classRes, statsRes] = await Promise.all([api.get(base), api.get(`${base}/stats/admin`)]);
    setClassInfo(classRes.data);
    setStats(statsRes.data);
    setPendingCount(statsRes.data.pendingRequests || 0);
  }

  useEffect(() => {
    loadHeader().catch((err) => setError(err.response?.data?.message || 'Could not load this class.'));
  }, [classGroupId]);

  async function togglePublish() {
    const res = await api.patch(base, { published: !classInfo.published });
    setClassInfo((c) => ({ ...c, published: res.data.published }));
  }

  return (
    <div className="space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark hover:underline dark:text-brand">
        <IconArrowLeft /> Back to my classes
      </Link>

      {error && <div className="rounded-xl bg-danger-bg p-4 text-sm text-danger-text dark:bg-red-900/30 dark:text-red-300">{error}</div>}

      {classInfo && (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {/* Replace with: <img src="/images/your-class-cover.jpg" className="h-40 w-full object-cover" /> */}
          <PhotoPlaceholder label="Class cover photo" className="h-40 w-full" rounded="rounded-none" />
          <div className="flex flex-wrap items-start justify-between gap-3 p-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-ink dark:text-slate-50">{classInfo.name}</h2>
                <Badge tone={classInfo.published ? 'success' : 'neutral'}>{classInfo.published ? 'Published' : 'Draft'}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-secondary dark:text-slate-400">{classInfo.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-secondary dark:text-slate-400">
                <span className="flex items-center gap-1"><IconClock /> {classInfo.schedule}</span>
                <span>Rs. {classInfo.monthlyFee} / month</span>
                {classInfo.grade && <span>{classInfo.grade}</span>}
              </div>
              {classInfo.subjects?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {classInfo.subjects.map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-ink-secondary dark:bg-slate-700 dark:text-slate-300">{s}</span>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={togglePublish}
              className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-ink hover:bg-brand-light dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {classInfo.published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Enrolled students" value={stats.totalStudents} icon={<IconUsers />} tone="brand" />
          <StatCard label="Today's attendance" value={`${stats.todayAttendancePct}%`} icon={<IconCheck />} tone="success" hint={stats.hasSessionToday ? 'Session marked' : 'No session today'} />
          <StatCard label="Pending fees" value={`Rs. ${stats.pendingPaymentsAmount}`} icon={<IconMoney />} tone="amber" hint={`${stats.pendingPaymentsCount} students`} />
          <StatCard label="Active quizzes" value={stats.activeQuizzes} icon={<IconQuiz />} tone="brand" />
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto rounded-lg bg-white p-1 shadow-sm dark:bg-slate-800 sm:inline-flex">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-brand text-white shadow-sm' : 'text-ink-secondary hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {t.label}
            {t.id === 'requests' && pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab onNavigate={setTab} />}
      {tab === 'requests' && <RequestsTab base={base} onCountChange={setPendingCount} />}
      {tab === 'attendance' && <AttendanceTab base={base} />}
      {tab === 'fees' && <FeesTab base={base} />}
      {tab === 'quizzes' && <QuizzesTab base={base} subjects={classInfo?.subjects || []} />}
      {tab === 'materials' && <MaterialsTab base={base} subjects={classInfo?.subjects || []} />}
      {tab === 'notices' && <NoticesTab base={base} />}
    </div>
  );
}

function OverviewTab({ onNavigate }) {
  const actions = [
    { id: 'requests', icon: <IconUsers />, title: 'Review requests', desc: 'Approve or reject students asking to join' },
    { id: 'attendance', icon: <IconCheck />, title: 'Mark attendance', desc: "Record today's session" },
    { id: 'fees', icon: <IconMoney />, title: 'Collect fees', desc: 'Generate & update this month' },
    { id: 'quizzes', icon: <IconQuiz />, title: 'Set a quiz', desc: 'Create an auto-graded MCQ quiz' },
    { id: 'materials', icon: <IconMaterial />, title: 'Upload materials', desc: 'Share notes & past papers' },
    { id: 'notices', icon: <IconBell />, title: 'Publish a notice', desc: 'Tell every student at once' },
  ];
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-base font-semibold text-ink dark:text-slate-100">Quick actions</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onNavigate(a.id)}
            className="flex items-start gap-3 rounded-xl border border-surface-border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md dark:border-slate-700"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand-dark dark:bg-brand-dark/20 dark:text-sky-300">{a.icon}</span>
            <span>
              <span className="block text-sm font-semibold text-ink dark:text-slate-100">{a.title}</span>
              <span className="block text-xs text-ink-secondary dark:text-slate-400">{a.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RequestsTab({ base, onCountChange }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  async function load() {
    const res = await api.get(`${base}/enrollments`);
    setEnrollments(res.data);
    onCountChange(res.data.filter((e) => e.status === 'pending').length);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [base]);

  async function respond(id, status) {
    setBusy(id);
    try {
      await api.patch(`${base}/enrollments/${id}`, { status });
      await load();
    } finally {
      setBusy('');
    }
  }

  if (loading) return <p className="text-sm text-ink-secondary dark:text-slate-400">Loading…</p>;

  const pending = enrollments.filter((e) => e.status === 'pending');
  const decided = enrollments.filter((e) => e.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="flex items-center gap-2 text-base font-semibold text-ink dark:text-slate-100"><IconUsers /> Pending requests</h3>
        <ul className="mt-4 space-y-3">
          {pending.length === 0 && <li className="text-sm text-ink-secondary dark:text-slate-400">No pending requests right now.</li>}
          {pending.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 border-b border-surface-border pb-3 last:border-0 last:pb-0 dark:border-slate-700">
              <div>
                <div className="text-sm font-medium text-ink dark:text-slate-100">{e.student?.name}</div>
                <div className="text-xs text-ink-secondary dark:text-slate-400">{e.student?.email} {e.student?.grade ? `· ${e.student.grade}` : ''}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy === e.id}
                  onClick={() => respond(e.id, 'approved')}
                  className="flex items-center gap-1 rounded-lg bg-success-bg px-3 py-1.5 text-xs font-semibold text-success-text hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
                >
                  <IconCheck /> Approve
                </button>
                <button
                  type="button"
                  disabled={busy === e.id}
                  onClick={() => respond(e.id, 'rejected')}
                  className="flex items-center gap-1 rounded-lg bg-danger-bg px-3 py-1.5 text-xs font-semibold text-danger-text hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300"
                >
                  <IconX /> Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-base font-semibold text-ink dark:text-slate-100">Past decisions</h3>
        <ul className="mt-4 space-y-3">
          {decided.length === 0 && <li className="text-sm text-ink-secondary dark:text-slate-400">No decisions made yet.</li>}
          {decided.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 border-b border-surface-border pb-3 last:border-0 last:pb-0 dark:border-slate-700">
              <div>
                <div className="text-sm font-medium text-ink dark:text-slate-100">{e.student?.name}</div>
                <div className="text-xs text-ink-secondary dark:text-slate-400">{e.student?.email}</div>
              </div>
              <Badge tone={e.status === 'approved' ? 'success' : 'danger'}>{e.status}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AttendanceTab({ base }) {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');

  async function loadSessions() {
    const [sRes, studRes] = await Promise.all([api.get(`${base}/sessions`), api.get(`${base}/students`)]);
    setSessions(sRes.data);
    setStudents(studRes.data);
    const today = sRes.data.find((s) => s.date.slice(0, 10) === todayISO());
    if (today) setSelectedSession(today._id);
    else if (sRes.data.length) setSelectedSession(sRes.data[sRes.data.length - 1]._id);
  }

  useEffect(() => {
    loadSessions().finally(() => setLoading(false));
  }, [base]);

  useEffect(() => {
    if (!selectedSession) return;
    api.get(`${base}/attendance/session/${selectedSession}`).then((res) => {
      const m = {};
      res.data.forEach((r) => { m[r.student._id] = r.status; });
      setMarks(m);
    });
  }, [selectedSession, base]);

  async function createTodaySession() {
    const res = await api.post(`${base}/sessions`, { date: todayISO(), topic: 'Class session' });
    setSessions((s) => [...s, res.data]);
    setSelectedSession(res.data._id);
  }

  async function mark(studentId, status) {
    setSaving(studentId);
    try {
      await api.post(`${base}/attendance`, { sessionId: selectedSession, studentId, status });
      setMarks((m) => ({ ...m, [studentId]: status }));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save attendance.');
    } finally {
      setSaving('');
    }
  }

  if (loading) return <p className="text-sm text-ink-secondary dark:text-slate-400">Loading…</p>;

  return (
    <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-ink dark:text-slate-100"><IconCalendar /> Mark attendance</h3>
        <div className="flex items-center gap-2">
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Select a session…</option>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>{new Date(s.date).toLocaleDateString()} {s.topic ? `— ${s.topic}` : ''}</option>
            ))}
          </select>
          <button type="button" onClick={createTodaySession} className="rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand-light dark:border-slate-700 dark:text-brand dark:hover:bg-slate-700">
            + Today's session
          </button>
        </div>
      </div>

      {message && <p className="mt-3 text-sm text-danger-text dark:text-red-300">{message}</p>}
      {students.length === 0 && <p className="mt-6 text-sm text-ink-secondary dark:text-slate-400">No approved students yet — approve a request first.</p>}

      {!selectedSession ? (
        students.length > 0 && <p className="mt-6 text-sm text-ink-secondary dark:text-slate-400">Create or pick a session to start marking attendance.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-secondary dark:border-slate-700 dark:text-slate-400">
                <th className="py-2 pr-4">Student</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-surface-border last:border-0 dark:border-slate-700">
                  <td className="py-3 pr-4 text-ink dark:text-slate-100">{s.name}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {['present', 'late', 'absent'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={saving === s.id}
                          onClick={() => mark(s.id, status)}
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                            marks[s.id] === status
                              ? status === 'present'
                                ? 'bg-success-bg text-success-text dark:bg-emerald-900/40 dark:text-emerald-300'
                                : status === 'late'
                                ? 'bg-warning-bg text-warning-text dark:bg-amber-900/40 dark:text-amber-300'
                                : 'bg-danger-bg text-danger-text dark:bg-red-900/40 dark:text-red-300'
                              : 'bg-slate-100 text-ink-secondary hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FeesTab({ base }) {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function load() {
    const [studRes, payRes] = await Promise.all([api.get(`${base}/students`), api.get(`${base}/payments`)]);
    setStudents(studRes.data);
    setPayments(payRes.data);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [base]);

  async function generate() {
    const res = await api.post(`${base}/payments/generate`, {});
    setMessage(`Created ${res.data.createdCount} fee record(s) for this month.`);
    load();
  }

  async function updateStatus(paymentId, status) {
    await api.patch(`${base}/payments/${paymentId}`, { status });
    load();
  }

  if (loading) return <p className="text-sm text-ink-secondary dark:text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="flex items-center gap-2 text-base font-semibold text-ink dark:text-slate-100"><IconUsers /> Students</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-secondary dark:border-slate-700 dark:text-slate-400">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Grade</th>
                <th className="py-2 pr-4">Attendance</th>
                <th className="py-2">Fee status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && <tr><td colSpan={4} className="py-4 text-ink-secondary dark:text-slate-400">No approved students yet.</td></tr>}
              {students.map((s) => (
                <tr key={s.id} className="border-b border-surface-border last:border-0 dark:border-slate-700">
                  <td className="py-3 pr-4 text-ink dark:text-slate-100">{s.name}<div className="text-xs text-ink-secondary dark:text-slate-400">{s.email}</div></td>
                  <td className="py-3 pr-4 text-ink-secondary dark:text-slate-400">{s.grade || '—'}</td>
                  <td className="py-3 pr-4 text-ink-secondary dark:text-slate-400">{s.attendancePct}%</td>
                  <td className="py-3"><Badge tone={paymentTone(s.paymentStatus)}>{s.paymentStatus}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-ink dark:text-slate-100"><IconMoney /> This month's fees</h3>
          <button type="button" onClick={generate} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            Generate this month's fees
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-success-text dark:text-emerald-300">{message}</p>}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-secondary dark:border-slate-700 dark:text-slate-400">
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && <tr><td colSpan={4} className="py-4 text-ink-secondary dark:text-slate-400">No fee records yet — generate this month's fees above.</td></tr>}
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-surface-border last:border-0 dark:border-slate-700">
                  <td className="py-3 pr-4 text-ink dark:text-slate-100">{p.student?.name}</td>
                  <td className="py-3 pr-4 text-ink-secondary dark:text-slate-400">Rs. {p.amount}</td>
                  <td className="py-3 pr-4"><Badge tone={paymentTone(p.status)}>{p.status}</Badge></td>
                  <td className="py-3">
                    <select
                      value={p.status}
                      onChange={(e) => updateStatus(p._id, e.target.value)}
                      className="rounded-md border border-surface-border bg-white px-2 py-1 text-xs text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="due">Due</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function emptyQuestion() {
  return { text: '', options: ['', '', '', ''], correctIndex: 0 };
}

function QuizzesTab({ base, subjects }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const fallbackSubjects = subjects.length ? subjects : ['General'];
  const [form, setForm] = useState({
    title: '', subject: fallbackSubjects[0], order: 1, dueDate: '', durationMinutes: 20, published: true,
    questions: [emptyQuestion()],
  });
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get(`${base}/quizzes`);
    setQuizzes(res.data);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [base]);

  function updateQuestion(i, patch) {
    setForm((f) => {
      const questions = [...f.questions];
      questions[i] = { ...questions[i], ...patch };
      return { ...f, questions };
    });
  }

  function updateOption(qi, oi, value) {
    setForm((f) => {
      const questions = [...f.questions];
      const options = [...questions[qi].options];
      options[oi] = value;
      questions[qi] = { ...questions[qi], options };
      return { ...f, questions };
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post(`${base}/quizzes`, form);
      setShowForm(false);
      setForm({ title: '', subject: fallbackSubjects[0], order: 1, dueDate: '', durationMinutes: 20, published: true, questions: [emptyQuestion()] });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create quiz.');
    }
  }

  async function remove(id) {
    await api.delete(`${base}/quizzes/${id}`);
    load();
  }

  if (loading) return <p className="text-sm text-ink-secondary dark:text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-semibold text-ink dark:text-slate-100"><IconQuiz /> Quizzes</h3>
          <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            {showForm ? 'Cancel' : '+ New quiz'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} className="mt-5 space-y-4 rounded-xl border border-dashed border-surface-border p-4 dark:border-slate-700">
            {error && <p className="text-sm text-danger-text dark:text-red-300">{error}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="Quiz title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                {fallbackSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input required type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              <input type="number" min={1} placeholder="Duration (minutes)" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              <input type="number" min={1} placeholder="Order (1st, 2nd quiz…)" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              <label className="flex items-center gap-2 text-sm text-ink-secondary dark:text-slate-300">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
                Publish immediately
              </label>
            </div>

            <div className="space-y-4">
              {form.questions.map((q, qi) => (
                <div key={qi} className="rounded-lg border border-surface-border p-3 dark:border-slate-700">
                  <input
                    placeholder={`Question ${qi + 1}`}
                    value={q.text}
                    onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                    className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi} onChange={() => updateQuestion(qi, { correctIndex: oi })} />
                        <input
                          placeholder={`Option ${oi + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          className="w-full rounded-md border border-surface-border bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setForm((f) => ({ ...f, questions: [...f.questions, emptyQuestion()] }))} className="text-sm font-medium text-brand-dark hover:underline dark:text-brand">
              + Add question
            </button>

            <button type="submit" className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              Create quiz
            </button>
          </form>
        )}

        <ul className="mt-5 space-y-3">
          {quizzes.length === 0 && <li className="text-sm text-ink-secondary dark:text-slate-400">No quizzes yet.</li>}
          {quizzes.map((q) => (
            <li key={q._id} className="flex items-center justify-between gap-2 border-b border-surface-border pb-3 last:border-0 last:pb-0 dark:border-slate-700">
              <div>
                <div className="text-sm font-medium text-ink dark:text-slate-100">{q.title}</div>
                <div className="text-xs text-ink-secondary dark:text-slate-400">{q.subject} · due {new Date(q.dueDate).toLocaleDateString()} · {q.attemptCount ?? 0} attempt(s)</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={q.published ? 'success' : 'neutral'}>{q.published ? 'Published' : 'Draft'}</Badge>
                <button type="button" onClick={() => remove(q._id)} className="text-xs font-medium text-danger-text hover:underline dark:text-red-300">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MaterialsTab({ base, subjects }) {
  const fallbackSubjects = subjects.length ? subjects : ['General'];
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', subject: fallbackSubjects[0], file: null });
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get(`${base}/materials`);
    setMaterials(res.data);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [base]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.file) { setError('Please choose a file.'); return; }
    const data = new FormData();
    data.append('title', form.title);
    data.append('subject', form.subject);
    data.append('file', form.file);
    try {
      await api.post(`${base}/materials`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ title: '', subject: fallbackSubjects[0], file: null });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    }
  }

  async function remove(id) {
    await api.delete(`${base}/materials/${id}`);
    load();
  }

  if (loading) return <p className="text-sm text-ink-secondary dark:text-slate-400">Loading…</p>;

  return (
    <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="flex items-center gap-2 text-base font-semibold text-ink dark:text-slate-100"><IconMaterial /> Learning materials</h3>

      <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-4">
        <input required placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:col-span-1" />
        <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          {fallbackSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input required type="file" onChange={(e) => setForm((f) => ({ ...f, file: e.target.files[0] }))} className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:col-span-1" />
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Upload</button>
      </form>
      {error && <p className="mt-2 text-sm text-danger-text dark:text-red-300">{error}</p>}

      <ul className="mt-5 space-y-3">
        {materials.length === 0 && <li className="text-sm text-ink-secondary dark:text-slate-400">No materials uploaded yet.</li>}
        {materials.map((m) => (
          <li key={m._id} className="flex items-center justify-between gap-2 border-b border-surface-border pb-3 last:border-0 last:pb-0 dark:border-slate-700">
            <div>
              <div className="text-sm font-medium text-ink dark:text-slate-100">{m.title}</div>
              <div className="text-xs text-ink-secondary dark:text-slate-400">{m.subject} · {m.fileName}</div>
            </div>
            <button type="button" onClick={() => remove(m._id)} className="text-xs font-medium text-danger-text hover:underline dark:text-red-300">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NoticesTab({ base }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', body: '' });
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get(`${base}/notices`);
    setNotices(res.data);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [base]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post(`${base}/notices`, form);
      setForm({ title: '', body: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish notice.');
    }
  }

  if (loading) return <p className="text-sm text-ink-secondary dark:text-slate-400">Loading…</p>;

  return (
    <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="flex items-center gap-2 text-base font-semibold text-ink dark:text-slate-100"><IconBell /> Class notices</h3>

      <form onSubmit={submit} className="mt-4 space-y-3">
        {error && <p className="text-sm text-danger-text dark:text-red-300">{error}</p>}
        <input required placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        <textarea required placeholder="Write the notice…" rows={3} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Publish notice</button>
      </form>

      <ul className="mt-5 space-y-3">
        {notices.length === 0 && <li className="text-sm text-ink-secondary dark:text-slate-400">No notices published yet.</li>}
        {notices.map((n) => (
          <li key={n._id} className="border-b border-surface-border pb-3 last:border-0 last:pb-0 dark:border-slate-700">
            <div className="text-sm font-medium text-ink dark:text-slate-100">{n.title}</div>
            <div className="mt-0.5 text-sm text-ink-secondary dark:text-slate-400">{n.body}</div>
            <div className="mt-1 text-xs text-ink-secondary dark:text-slate-500">{new Date(n.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
