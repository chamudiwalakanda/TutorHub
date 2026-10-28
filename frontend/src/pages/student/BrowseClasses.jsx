import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient.js';
import ClassCard from '../../components/ClassCard.jsx';
import Badge from '../../components/Badge.jsx';
import { IconSearch } from '../../components/icons.jsx';

export default function BrowseClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const navigate = useNavigate();

  async function load() {
    const res = await api.get('/classes/published');
    setClasses(res.data);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function requestEnroll(classId) {
    setBusy(classId);
    setError('');
    try {
      await api.post(`/classes/${classId}/enroll`, {});
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the request.');
    } finally {
      setBusy('');
    }
  }

  if (loading) return <p className="text-sm text-ink-secondary dark:text-slate-400">Loading classes…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-ink dark:text-slate-50"><IconSearch /> Browse classes</h2>
        <p className="text-sm text-ink-secondary dark:text-slate-400">Find a class and request to join — your teacher approves each request.</p>
      </div>

      {error && <div className="rounded-xl bg-danger-bg p-4 text-sm text-danger-text dark:bg-red-900/30 dark:text-red-300">{error}</div>}

      {classes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-surface-border p-8 text-center text-sm text-ink-secondary dark:border-slate-700 dark:text-slate-400">
          No published classes yet — check back soon.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <ClassCard
              key={c.id}
              classData={c}
              footer={
                c.enrollmentStatus === 'approved' ? (
                  <button type="button" onClick={() => navigate(`/dashboard/classes/${c.id}`)} className="w-full rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
                    Open class
                  </button>
                ) : c.enrollmentStatus === 'pending' ? (
                  <Badge tone="warning">Request pending</Badge>
                ) : c.enrollmentStatus === 'rejected' ? (
                  <button
                    type="button"
                    disabled={busy === c.id}
                    onClick={() => requestEnroll(c.id)}
                    className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm font-semibold text-ink hover:bg-brand-light dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    Request declined — ask again
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy === c.id}
                    onClick={() => requestEnroll(c.id)}
                    className="w-full rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {busy === c.id ? 'Sending…' : 'Request to enroll'}
                  </button>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
