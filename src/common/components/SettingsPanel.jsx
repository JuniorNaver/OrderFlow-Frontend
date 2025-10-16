import { useState, useEffect, useLayoutEffect } from "react";
import { X } from "lucide-react";
import StoreInitAdminTab from "../pages/settings/admin/StoreInitAdminTab";
import StoreUpdateAdminTab from "../pages/settings/admin/StoreUpdateAdminTab";
import StoreUpdateUserTab from "../pages/settings/user/StoreUpdateUserTab";

const SettingsPanel = ({ open, onClose }) => {
  const user = { role: "ADMIN" };
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [activeTab, setActiveTab] = useState("store");

  useEffect(() => {
    if (open) {
      // 1️⃣ mount
      setVisible(true);
    } else {
      // 2️⃣ unmount 지연
      setAnimate(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // ✅ mount 후 첫 프레임에서 슬라이드 인 적용
  useLayoutEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        setAnimate(true);
        document.body.style.overflow = "hidden";
      });
    } else {
      document.body.style.overflow = "";
    }
  }, [visible]);

  if (!visible) return null;

  const isAdmin = user.role === "ADMIN";

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* 배경 */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          animate ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 패널 본체 */}
      <div
        className={`absolute top-0 right-0 w-full sm:w-[480px] h-full bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          animate ? "translate-x-0" : "translate-x-full"
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

        {/* 탭 */}
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

        {/* 콘텐츠 */}
        <div className="p-5 overflow-y-auto h-[calc(100%-110px)]">
          {activeTab === "store" && (
            <>
              {isAdmin ? (
                <>
                  <StoreInitAdminTab />
                  <div className="mt-6 border-t pt-4">
                    <StoreUpdateAdminTab />
                  </div>
                </>
              ) : (
                <StoreUpdateUserTab user={user} />
              )}
            </>
          )}

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
};

export default SettingsPanel;
