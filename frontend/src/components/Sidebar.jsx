import { NavLink } from 'react-router-dom';

export default function Sidebar({ title, links, open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed z-40 flex h-full w-64 flex-col border-r border-surface-border bg-white transition-transform duration-200 dark:border-slate-700 dark:bg-slate-800 lg:static lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-surface-border px-5 dark:border-slate-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            TH
          </div>
          <div>
            <div className="text-sm font-semibold text-ink dark:text-slate-100">TutorHub</div>
            <div className="text-xs text-ink-secondary dark:text-slate-400">{title}</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-light text-brand-dark dark:bg-brand-dark/25 dark:text-sky-300'
                    : 'text-ink-secondary hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`
              }
            >
              <span className="h-5 w-5 flex-shrink-0">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
