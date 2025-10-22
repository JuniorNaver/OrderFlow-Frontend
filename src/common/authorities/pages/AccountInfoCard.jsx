import { User, LogOut } from "lucide-react";
import { useAuth } from "../component/useAuth";

export default function AccountInfoCard() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <User size={18} className="text-blue-600" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{user.name}</span>
          <span className="text-xs text-gray-500">
            {user.role} · {user.storeName || "미배정"}
          </span>
        </div>
      </div>

      <button
        onClick={logout}
        className="text-gray-500 hover:text-red-600 transition-colors"
        title="로그아웃"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
