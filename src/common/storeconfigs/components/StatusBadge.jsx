// src/common/storeconfigs/components/StatusBadge.jsx
import { Power, PowerOff } from "lucide-react";

const StatusBadge = ({ active, onToggle, isLoading = false }) => {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200
        ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
        ${
          active
            ? "bg-green-600 text-white shadow-[0_0_8px_rgba(34,197,94,0.7)] hover:scale-[1.02] active:scale-95 animate-pulse"
            : "bg-gray-400 text-gray-100 hover:bg-gray-500"
        }`}
    >
      {active ? (
        <Power className="w-3.5 h-3.5" />
      ) : (
        <PowerOff className="w-3.5 h-3.5" />
      )}
      {active ? "운영중" : "비활성"}
    </button>
  );
};

export default StatusBadge;
