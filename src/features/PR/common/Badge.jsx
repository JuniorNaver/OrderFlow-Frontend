export function Badge({ className = "", children }) {
  return (
    <span className={`inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 ${className}`}>
      {children}
    </span>
  );
}