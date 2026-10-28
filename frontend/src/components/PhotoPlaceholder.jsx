/**
 * A styled stand-in for a photo. Drop your own image into /public/images/
 * and swap this component for a plain <img src="/images/your-photo.jpg" />
 * wherever you see it used — e.g. in Landing.jsx and Login.jsx.
 */
export default function PhotoPlaceholder({ label, className = '', rounded = 'rounded-2xl' }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand to-brand-dark text-white ${rounded} ${className}`}
    >
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_35%),radial-gradient(circle_at_80%_60%,white_0,transparent_30%)]" />
      <div className="relative flex flex-col items-center gap-2 p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10 opacity-80">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-4.5-4.5a1.5 1.5 0 00-2.12 0L7 18" />
        </svg>
        <span className="text-xs font-medium uppercase tracking-wide opacity-90">{label}</span>
      </div>
    </div>
  );
}
