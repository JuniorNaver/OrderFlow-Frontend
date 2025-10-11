import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import RecommendPage from "./RecommendPage";
import OrdersPage from "./OrderPage";
import ShopPage from "./ShopPage";
import SearchProducts from "./SearchProducts";

export default function PRPage() {
  // 데모용 storeId 고정 (나중에 로그인/드롭다운으로 교체)
  const defaultStoreId = "S001";
  const { pathname } = useLocation();

  return (
    <div className="space-y-4">
      {/* 탭에 '카탈로그' 추가 */}
      <nav className="flex gap-3 text-sm">
        <Link to={`stores/${defaultStoreId}/orders`} className={pathname.includes("/orders") ? "font-bold" : ""}>
          발주
        </Link>
        <Link to={`stores/${defaultStoreId}/recommend`} className={pathname.includes("/recommend") ? "font-bold" : ""}>
          추천
        </Link>
      </nav>

      <Routes>
        {/* 기본 진입: 발주 페이지로 리다이렉트 */}
        <Route index element={<Navigate to={`stores/${defaultStoreId}/orders`} replace />} />
        <Route path="stores/:storeId/shop" element={<ShopPage />} />
        <Route path="stores/:storeId/orders" element={<OrdersPage />} />
        <Route path="stores/:storeId/recommend" element={<RecommendPage />} />
        <Route path="stores/:storeId/search" element={<SearchProducts />} />

        {/* 혹시 모를 404는 발주로 */}
        <Route path="*" element={<Navigate to={`stores/${defaultStoreId}/orders`} replace />} />
      </Routes>
    </div>
  );
}