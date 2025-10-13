import { Routes, Route, Navigate, NavLink } from "react-router-dom";

export default function PRPage() {
  // 데모용 storeId 고정 (나중에 로그인/드롭다운으로 교체)

  return (
    <div className="space-y-4">
      {/* 탭에 '카탈로그' 추가 */}
      <nav className="flex gap-3 text-sm">
        <NavLink
          to="/pr/orders"
          className={({ isActive }) => (isActive ? "font-bold underline" : "")}
          end
        >
          발주
        </NavLink>
        <NavLink
          to="/pr/recommend"
          className={({ isActive }) => (isActive ? "font-bold underline" : "")}
          end
        >
          추천
        </NavLink>
        <NavLink
          to="/pr/search"
          className={({ isActive }) => (isActive ? "font-bold underline" : "")}
          end
        >
          검색
        </NavLink>
        <NavLink
          to="/pr/shop"
          className={({ isActive }) => (isActive ? "font-bold underline" : "")}
          end
        >
          쇼핑
        </NavLink>
      </nav>

      {/* 실제 내용은 App.jsx의 Route 자식들이 여기에 표시됨 */}
    </div>
  );
}