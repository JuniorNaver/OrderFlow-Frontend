import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import Logo from "./Logo";

export default function Drawer({ open, onClose, isPOS, togglePOS, menus }) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* 오버레이 */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          open ? "opacity-30" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* 드로어 본체 */}
      <div
        className={`absolute top-0 left-0 w-64 h-full bg-white shadow-lg p-4 flex flex-col transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 상단 로고 + 닫기 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <Logo />
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* 토글 */}
        <div
          className="relative w-full h-9 bg-gray-200 rounded-full flex items-center cursor-pointer select-none mb-6"
          onClick={togglePOS}
        >
          <div
            className={`absolute top-1 left-1 w-1/2 h-7 rounded-full bg-blue-500 transition-transform duration-300 ease-out ${
              isPOS ? "translate-x-full" : "translate-x-0"
            }`}
          />
          <div className="relative z-10 flex w-full h-full">
            <div
              className={`flex-1 flex items-center justify-center font-bold text-sm ${
                !isPOS ? "text-white" : "text-gray-600"
              }`}
            >
              재고
            </div>
            <div
              className={`flex-1 flex items-center justify-center font-bold text-sm ${
                isPOS ? "text-white" : "text-gray-600"
              }`}
            >
              POS
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <nav className="flex flex-col gap-4">
          {menus.map((menu) => (
            <NavLink
              key={menu.label}
              to={menu.path}
              className="text-gray-700 hover:text-blue-600"
              onClick={onClose}
            >
              {menu.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
