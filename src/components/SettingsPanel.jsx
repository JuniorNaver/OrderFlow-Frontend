import { useState, useEffect } from "react";
import { X } from "lucide-react";
import StoreInitTab from "../common/pages/settings/admin/StoreInitTab";
import StoreUpdateTab from "../common/pages/settings/user/StoreUpdateTab";
import { useAuth } from "../common/context/AuthContext";


// import AccountManageTab from "../common/pages/settings/account/AccountManageTab";
// import AccountUpdateTab from "../common/pages/settings/account/AccountUpdateTab";
// import RoleSettingsTab from "../common/pages/settings/RoleSettingsTab";
// import SystemSettingsTab from "../common/pages/settings/SystemSettingsTab";

export default function SettingsPanel({ open, onClose }) {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("system");
  const { user } = useAuth(); // ✅ 전역 user 접근
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [open]);

  // ✅ 역할별 탭 구성
  const tabs = isAdmin
    ? [
      { key: "store-init", label: "지점 초기 설정" },
      { key: "account-manage", label: "계정 관리" },
      { key: "role", label: "권한 관리" },
      { key: "system", label: "시스템 환경" },
    ]
    : [
      { key: "store-update", label: "지점 정보 수정" },
      { key: "account-update", label: "계정 정보" },
      { key: "system", label: "시스템 환경" },
    ];

  // 기본 탭 고정 (권한에 따라)
  useEffect(() => {
    setActiveTab(isAdmin ? "store-init" : "store-update");
  }, [isAdmin]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* 오버레이 */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${visible ? "opacity-30" : "opacity-0"
          }`}
        onClick={onClose}
      ></div>

      {/* 본체 */}
      <div
        className={`absolute top-0 right-0 w-[420px] h-full bg-white shadow-lg p-4 flex flex-col transform transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">설정</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-600 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === tab.key
                  ? "border-blue-500 text-blue-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="flex-1 overflow-y-auto text-sm text-gray-700">
          {/* 관리자용 */}
          {activeTab === "store-init" && isAdmin && <StoreInitTab />}
          {/* {activeTab === "account-manage" && isAdmin && <AccountManageTab />}
          {activeTab === "role" && isAdmin && <RoleSettingsTab />} */}

          {/* 공용(관리자+점장) */}
          {activeTab === "store-update" && <StoreUpdateTab />}
          {/* {activeTab === "account-update" && <AccountUpdateTab />}
          {activeTab === "system" && <SystemSettingsTab />} */}
        </div>
      </div>
    </div>
  );
}
