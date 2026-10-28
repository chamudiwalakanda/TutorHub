export default function StatCard({ label, value, hint, icon, tone = 'brand' }) {
  const toneMap = {
    brand: 'bg-brand-light text-brand-dark dark:bg-brand-dark/20 dark:text-sky-300',
    success: 'bg-success-bg text-success-text dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-warning-bg text-warning-text dark:bg-amber-900/30 dark:text-amber-300',
    amber: 'bg-amber/10 text-amber-dark dark:bg-amber/20 dark:text-amber',
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-secondary dark:text-slate-400">{label}</span>
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneMap[tone]}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold text-ink dark:text-slate-50">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-secondary dark:text-slate-400">{hint}</div>}
    </div>
  );
}
