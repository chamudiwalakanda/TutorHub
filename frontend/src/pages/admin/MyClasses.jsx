import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient.js';
import ClassCard from '../../components/ClassCard.jsx';
import Badge from '../../components/Badge.jsx';
import { IconPlus } from '../../components/icons.jsx';

function emptyForm() {
  return { name: '', grade: '', subjects: '', description: '', schedule: '', monthlyFee: 3000, maxStudents: 15, published: true };
}

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function load() {
    const res = await api.get('/classes/mine');
    setClasses(res.data);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/classes', {
        ...form,
        subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
        monthlyFee: Number(form.monthlyFee),
        maxStudents: Number(form.maxStudents),
      });
      setForm(emptyForm());
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the class.');
    }
  }

  if (loading) return <p className="text-sm text-ink-secondary dark:text-slate-400">Loading your classes…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink dark:text-slate-50">My classes</h2>
          <p className="text-sm text-ink-secondary dark:text-slate-400">Every class you teach, and the students enrolled in each.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <IconPlus /> {showForm ? 'Cancel' : 'Create a class'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-dashed border-surface-border bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          {error && <p className="text-sm text-danger-text dark:text-red-300">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Class name (e.g. Grade 11 - Combined Maths)"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:col-span-2"
            />
            <input
              placeholder="Grade (e.g. Grade 11)"
              value={form.grade}
              onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
              className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <input
              placeholder="Schedule (e.g. Sat-Sun, 2:00-6:00 PM)"
              value={form.schedule}
              onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
              className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <input
              placeholder="Subjects, comma separated (e.g. Pure Maths, Statistics)"
              value={form.subjects}
              onChange={(e) => setForm((f) => ({ ...f, subjects: e.target.value }))}
              className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:col-span-2"
            />
            <input
              type="number"
              min={0}
              placeholder="Monthly fee (Rs.)"
              value={form.monthlyFee}
              onChange={(e) => setForm((f) => ({ ...f, monthlyFee: e.target.value }))}
              className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <input
              type="number"
              min={1}
              placeholder="Max students"
              value={form.maxStudents}
              onChange={(e) => setForm((f) => ({ ...f, maxStudents: e.target.value }))}
              className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <textarea
              placeholder="Short description for students browsing classes"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:col-span-2"
            />
            <label className="flex items-center gap-2 text-sm text-ink-secondary dark:text-slate-300 sm:col-span-2">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
              Publish immediately so students can find and request this class
            </label>
          </div>
          <button type="submit" className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            Create class
          </button>
        </form>
      )}

      {classes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-surface-border p-8 text-center text-sm text-ink-secondary dark:border-slate-700 dark:text-slate-400">
          You don't have any classes yet — create your first one above.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <ClassCard
              key={c.id}
              classData={c}
              onClick={() => navigate(`/admin/classes/${c.id}`)}
              footer={
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <Badge tone={c.published ? 'success' : 'neutral'}>{c.published ? 'Published' : 'Draft'}</Badge>
                    {c.pendingCount > 0 && <Badge tone="warning">{c.pendingCount} pending</Badge>}
                  </div>
                  <span className="text-xs font-medium text-brand-dark dark:text-brand">{c.approvedCount} student{c.approvedCount === 1 ? '' : 's'}</span>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
