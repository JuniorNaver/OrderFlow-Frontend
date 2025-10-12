import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import RecommendPage from "./RecommendPage";
import OrdersPage from "./OrderPage";
import ShopPage from "./ShopPage";
import SearchProducts from "./SearchProducts";

export default function PRPage() {
  // 데모용 storeId 고정 (나중에 로그인/드롭다운으로 교체)
  const defaultStoreId = "S001"

  return (
    <div className="space-y-4">
      {/* 탭에 '카탈로그' 추가 */}
      <nav className="flex gap-3 text-sm">
        <NavLink
          to={`stores/${defaultStoreId}/orders`}
          className={({ isActive }) => (isActive ? "font-bold" : "")}
          end
        >
          발주
        </NavLink>
        <NavLink
          to={`stores/${defaultStoreId}/recommend`}
          className={({ isActive }) => (isActive ? "font-bold" : "")}
          end
        >
          추천
        </NavLink>
      </nav>

      <Routes>
        {/* 기본 진입은 해당 매장의 발주로 */}
        <Route index element={<Navigate to={`stores/${defaultStoreId}/orders`} replace />} />

        {/* 축약 경로로 들어온 경우도 리다이렉트 */}
        <Route path="orders" element={<Navigate to={`stores/${defaultStoreId}/orders`} replace />} />
        <Route path="recommend" element={<Navigate to={`stores/${defaultStoreId}/recommend`} replace />} />
        <Route path="search" element={<Navigate to={`stores/${defaultStoreId}/search`} replace />} />
        <Route path="shop" element={<Navigate to={`stores/${defaultStoreId}/shop`} replace />} />

        {/* 실제 라우트 */}
        <Route path="stores/:storeId/orders" element={<OrdersPage />} />
        <Route path="stores/:storeId/recommend" element={<RecommendPage />} />
        <Route path="stores/:storeId/search" element={<SearchProducts />} />
        <Route path="stores/:storeId/shop" element={<ShopPage />} />

        {/* 혹시 모를 404는 발주로 */}
        <Route path="*" element={<Navigate to={`stores/${defaultStoreId}/orders`} replace />} />
      </Routes>
    </div>
  );
}