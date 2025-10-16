import { Sun, Refrigerator, Snowflake, PackageOpen } from "lucide-react";

const DEFAULTS = [
  { key: "room",    label: "실온",  icon: <Sun className="h-4 w-4" /> },
  { key: "chilled", label: "냉장",  icon: <Refrigerator className="h-4 w-4" /> },
  { key: "frozen",  label: "냉동",  icon: <Snowflake className="h-4 w-4" /> },
  { key: "other",   label: "기타",  icon: <PackageOpen className="h-4 w-4" /> },
];

export default function ZoneTabs({ value, onChange, items = DEFAULTS }) {
  return (
    <div className="flex gap-2">
      {items.map(z => (
        <button key={z.key}
          onClick={() => onChange(z.key)}
          className={`px-3 py-1 rounded-full text-sm border flex items-center gap-1
            ${z.key===value ? "bg-black text-white" : "bg-white hover:bg-slate-50"}`}>
          {z.icon}{z.label}
        </button>
      ))}
    </div>
  );
}