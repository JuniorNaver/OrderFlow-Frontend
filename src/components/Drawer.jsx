import { NavLink } from "react-router-dom";
import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import Logo from "./Logo";

export default function Drawer({ open, onClose, isPOS, togglePOS, menus }) {
  const [openMenus, setOpenMenus] = useState({});
  const [hoverMenu, setHoverMenu] = useState(null);

  const isMobile = window.innerWidth < 768;

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // NavLink 스타일
  const linkClass = ({ isActive }) =>
    `flex justify-between items-center py-2 transition-colors ${
      isActive ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"
    }`;

  const childLinkClass = ({ isActive }) =>
    `text-sm block px-3 py-1 transition-colors ${
      isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"
    }`;

  // children 렌더링
  const renderChildren = (menu, isOpen) => {
    if (!menu.children || !isOpen) return null;

    return isMobile ? (
      // 모바일: 상위 아래 인라인
      <div className="ml-4 pl-3 border-l-2 border-gray-200 flex flex-col gap-1">
        {menu.children.map((child) => (
          <NavLink
            key={child.label}
            to={child.path}
            className={childLinkClass}
            onClick={onClose}
          >
            {child.label}
          </NavLink>
        ))}
      </div>
    ) : (
      // 데스크톱: 오른쪽 드롭다운
      <div className="absolute top-0 left-full ml-1 bg-white border border-gray-200 shadow-lg rounded-md py-2 w-48">
        {menu.children.map((child) => (
          <NavLink
            key={child.label}
            to={child.path}
            className={childLinkClass}
            onClick={onClose}
          >
            {child.label}
          </NavLink>
        ))}
      </div>
    );
  };

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
        {/* 상단 로고 + 닫기 */}
        <div className="flex justify-between items-center mb-6">
          <Logo />
          <button
            onClick={onClose}
            className="p-1 text-gray-600 hover:text-black transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 재고 / POS 슬라이더 */}
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
        <nav className="flex flex-col gap-2 relative">
          {menus.map((menu) => {
            const isOpen = isMobile
              ? openMenus[menu.label] // 모바일: 클릭 토글
              : hoverMenu === menu.label; // 데스크탑: hover

            return (
              <div
                key={menu.label}
                className="relative"
                onMouseEnter={() => !isMobile && setHoverMenu(menu.label)}
                onMouseLeave={() => !isMobile && setHoverMenu(null)}
              >
                {/* 상위 메뉴 */}
                <NavLink
                  to={menu.path}
                  className={linkClass}
                  onClick={() => {
                    if (isMobile && menu.children) {
                      toggleMenu(menu.label);
                    } else {
                      onClose();
                    }
                  }}
                >
                  {menu.label}
                  {menu.children && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </NavLink>

                {/* 하위 메뉴 */}
                {renderChildren(menu, isOpen)}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
