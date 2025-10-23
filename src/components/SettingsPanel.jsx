import { useState, useEffect, useLayoutEffect } from "react";
import { X } from "lucide-react";
import StoreEnvTab from "../common/storeconfigs/pages/StoreEnvTab";
import StoreAdminTab from "../common/storeconfigs/pages/StoreAdminTab";
import WarehouseManageTab from "../common/storeconfigs/pages/WarehouseManageTab";
import FinanceManageTab from "../common/storeconfigs/pages/FinanceManageTab";
import AccountManage from "../common/authorities/pages/AccountManage";
import { useAuth } from "../common/authorities/component/useAuth";

const SettingsPanel = ({ open, onClose }) => {
  const { user, isAuthenticated } = useAuth(); // ✅ 실제 로그인 사용자 정보
  const isAdmin = user?.role === "ADMIN";
  const storeId = user?.storeId;

  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("store");
  const [activeStoreSubTab, setActiveStoreSubTab] = useState("info");

  useEffect(() => {
    if (open) setVisible(true);
    else {
      setAnimate(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        setAnimate(true);
        document.body.style.overflow = "hidden";
      });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  // ✅ 반응형 탭 라벨 (PC: 풀네임 / 모바일: 짧은명)
  const tabLabel = (full, short) => (
    <>
      <span className="hidden sm:inline">{full}</span>
      <span className="sm:hidden">{short}</span>
    </>
  );

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
        }`}
    >
      {/* 오버레이 */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
          }`}
        onClick={onClose}
      />

      {/* 패널 */}
      <div
        className={`absolute top-0 right-0 w-full sm:w-[520px] h-full bg-white shadow-2xl transform transition-transform duration-300 ease-out ${animate ? "translate-x-0" : "translate-x-full"
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

        {/* 메인 탭 */}
        <div className="flex border-b text-sm font-medium text-gray-600">
          <button
            className={`flex-1 py-2 text-center transition-colors ${activeMainTab === "store"
                ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
                : "hover:text-blue-500"
              }`}
            onClick={() => setActiveMainTab("store")}
          >
            {tabLabel("지점 설정", "지점")}
          </button>
          <button
            className={`flex-1 py-2 text-center transition-colors ${activeMainTab === "account"
                ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
                : "hover:text-blue-500"
              }`}
            onClick={() => setActiveMainTab("account")}
          >
            {tabLabel("계정 설정", "계정")}
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-5 overflow-y-auto h-[calc(100%-110px)]">
          {/* 🏪 지점 설정 */}
          {activeMainTab === "store" && (
            <>
              {/* 서브탭 */}
              <div className="flex mb-3 border-b text-sm font-medium text-gray-500">
                <button
                  className={`flex-1 py-2 text-center ${activeStoreSubTab === "info"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
                      : "hover:text-blue-500"
                    }`}
                  onClick={() => setActiveStoreSubTab("info")}
                >
                  점포 정보
                </button>
                <button
                  className={`flex-1 py-2 text-center ${activeStoreSubTab === "capacity"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
                      : "hover:text-blue-500"
                    }`}
                  onClick={() => setActiveStoreSubTab("capacity")}
                >
                  창고 용량
                </button>
                <button
                  className={`flex-1 py-2 text-center ${activeStoreSubTab === "finance"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
                      : "hover:text-blue-500"
                    }`}
                  onClick={() => setActiveStoreSubTab("finance")}
                >
                  예산·고정비
                </button>
              </div>

              {/* 내부 콘텐츠 - 권한별 분기 */}
              {activeStoreSubTab === "info" &&
                (isAdmin ? <StoreAdminTab /> : <StoreEnvTab user={user} />)}
              {activeStoreSubTab === "capacity" &&
                (isAdmin ? (
                  <WarehouseManageTab storeId={user.storeId} mode="admin" />
                ) : (
                  <WarehouseManageTab storeId={user.storeId} mode="user" />
                ))}

              {activeStoreSubTab === "finance" &&
                (isAdmin ? (
                  <FinanceManageTab storeId={user.storeId} mode="admin" />
                ) : (
                  <FinanceManageTab storeId={user.storeId} mode="user" />
                ))}
            </>
          )}

          {/* 👤 계정 설정 */}
          {activeMainTab === "account" && <AccountManage />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
