import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import StoreInitAdminTab from "../admin/StoreInitAdminTab";
import StoreUpdateAdminTab from "../admin/StoreUpdateAdminTab";
import StoreUpdateUserTab from "../common/pages/settings/user/StoreUpdateUserTab";

// 탭 컴포넌트 임포트

export default function SettingsPanel({ open, onClose }) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("store");

  // Drawer와 동일한 부드러운 모션 효과
  useEffect(() => {
    if (open) {
      setVisible(true);
      document.body.style.overflow = "hidden"; // 스크롤 잠금
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible) return null;

  // 권한 구분
  const isAdmin = user?.role === "ADMIN" || user?.roles?.includes("ROLE_ADMIN");
  const isUser = !isAdmin;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* 반투명 배경 */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 패널 본체 */}
      <div
        className={`absolute top-0 right-0 w-full sm:w-[480px] h-full bg-white shadow-2xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">⚙️ 설정</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-600 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b text-sm font-medium text-gray-600">
          <button
            className={`flex-1 py-2 text-center transition-colors ${
              activeTab === "store"
                ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
                : "hover:text-blue-500"
            }`}
            onClick={() => setActiveTab("store")}
          >
            지점 설정
          </button>
          <button
            className={`flex-1 py-2 text-center transition-colors ${
              activeTab === "account"
                ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
                : "hover:text-blue-500"
            }`}
            onClick={() => setActiveTab("account")}
          >
            계정 설정
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="p-5 overflow-y-auto h-[calc(100%-110px)]">
          {/* 🏪 Store 탭 */}
          {activeTab === "store" && (
            <>
              {isAdmin ? (
                <>
                  {/* 관리자용: 초기 등록 또는 수정 탭 */}
                  <StoreInitAdminTab />
                  <div className="mt-6 border-t pt-4">
                    <StoreUpdateAdminTab />
                  </div>
                </>
              ) : (
                <StoreUpdateUserTab />
              )}
            </>
          )}

          {/* 👤 Account 탭 */}
          {activeTab === "account" && (
            <div className="text-sm text-gray-700 space-y-3">
              <p>
                <strong>이름:</strong> {user?.name || "-"}
              </p>
              <p>
                <strong>이메일:</strong> {user?.email || "-"}
              </p>
              <p>
                <strong>역할:</strong>{" "}
                {isAdmin ? "관리자 (ADMIN)" : "일반 사용자 (USER)"}
              </p>

              <button
                className="mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm"
                onClick={() => alert("계정 관리 기능은 추후 추가 예정입니다.")}
              >
                계정 관리
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
