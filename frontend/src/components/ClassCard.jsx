import PhotoPlaceholder from './PhotoPlaceholder.jsx';
import { IconClock } from './icons.jsx';

/**
 * A class "card" used on My Classes / Browse Classes, for both roles.
 * `footer` is whatever action/status element the page wants to show
 * (a button, a badge, an approve/reject row, etc).
 */
export default function ClassCard({ classData, footer, onClick }) {
  const c = classData;
  return (
    <div
      onClick={onClick}
      className={`flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-sm transition-all dark:border-slate-700 dark:bg-slate-800 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''
      }`}
    >
      {/*<img src="/images/cmaths1.png" className="h-32 w-full object-cover" /> */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-ink dark:text-slate-100">{c.name}</h3>
          {c.grade && (
            <span className="whitespace-nowrap rounded-full bg-brand-light px-2.5 py-1 text-xs font-medium text-brand-dark dark:bg-brand-dark/20 dark:text-sky-300">
              {c.grade}
            </span>
          )}
        </div>
        {c.teacherName && <p className="mt-0.5 text-xs text-ink-secondary dark:text-slate-400">by {c.teacherName}</p>}
        {c.description && <p className="mt-2 text-sm text-ink-secondary dark:text-slate-400 line-clamp-2">{c.description}</p>}

        {c.subjects?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {c.subjects.map((s) => (
              <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-ink-secondary dark:bg-slate-700 dark:text-slate-300">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-secondary dark:text-slate-400">
          <IconClock />
          {c.schedule}
        </div>
        <div className="mt-1 text-xs text-ink-secondary dark:text-slate-400">Rs. {c.monthlyFee} / month</div>

        <div className="mt-4 pt-3">{footer}</div>
      </div>
    </div>
  );
}
