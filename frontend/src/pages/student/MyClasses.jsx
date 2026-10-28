import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient.js';
import ClassCard from '../../components/ClassCard.jsx';
import Badge from '../../components/Badge.jsx';
import { IconSearch } from '../../components/icons.jsx';

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/classes/enrolled').then((res) => setClasses(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-ink-secondary dark:text-slate-400">Loading your classes…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink dark:text-slate-50">My classes</h2>
          <p className="text-sm text-ink-secondary dark:text-slate-400">Classes you've joined or requested to join.</p>
        </div>
        <Link to="/dashboard/browse" className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          <IconSearch /> Browse classes
        </Link>
      </div>

      {classes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-surface-border p-8 text-center text-sm text-ink-secondary dark:border-slate-700 dark:text-slate-400">
          You haven't joined a class yet — browse published classes and request a seat.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <ClassCard
              key={c.id}
              classData={c}
              onClick={c.enrollmentStatus === 'approved' ? () => navigate(`/dashboard/classes/${c.id}`) : undefined}
              footer={
                c.enrollmentStatus === 'approved' ? (
                  <span className="text-xs font-semibold text-brand-dark dark:text-brand">Open class →</span>
                ) : c.enrollmentStatus === 'pending' ? (
                  <Badge tone="warning">Waiting for teacher approval</Badge>
                ) : (
                  <Badge tone="danger">Request declined</Badge>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
