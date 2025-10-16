export function Card({ className = "", onClick, children }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={`px-4 pt-4 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <div className={`text-lg font-semibold leading-tight ${className}`}>{children}</div>;
}

export function CardContent({ className = "", children }) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>;
}