const toneMap = {
  success: 'bg-success-bg text-success-text dark:bg-emerald-900/30 dark:text-emerald-300',
  warning: 'bg-warning-bg text-warning-text dark:bg-amber-900/30 dark:text-amber-300',
  danger: 'bg-danger-bg text-danger-text dark:bg-red-900/30 dark:text-red-300',
  brand: 'bg-brand-light text-brand-dark dark:bg-brand-dark/20 dark:text-sky-300',
  neutral: 'bg-slate-100 text-ink-secondary dark:bg-slate-700 dark:text-slate-300',
};

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneMap[tone]}`}>
      {children}
    </span>
  );
}
