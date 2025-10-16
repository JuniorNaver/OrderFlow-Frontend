// options: 배열 (문자열[] 또는 {label, value, badge}[])
export default function LevelPicker({ label, options = [], value, onChange }) {
  const opts = options.map(o => typeof o === "string" ? { label: o, value: o } : o);
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="flex flex-wrap gap-2">
        {opts.map(o => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 rounded-full border text-sm ${
              value === o.value ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"
            }`}
            title={o.label}
          >
            <span className="align-middle">{o.label}</span>
            {o.badge != null && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border">
                {o.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}