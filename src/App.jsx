import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import RootProvider from "./common/RootProvider"; // ✅ 모든 Provider 통합
import "./styles/App.css";

// 공용 UI
import Header from "./components/Header";
import NotFound from "./components/error/NotFound";

// 메뉴 데이터
import posMenus from "./components/menus/posMenus";
import stockMenus from "./components/menus/stockMenus";

// 인증 관련
import ProtectedRoute from "./common/authorities/component/ProtectedRoute";
import Login from "./common/authorities/pages/Login";
import MyPage from "./common/authorities/pages/MyPage";
import AccountManage from "./common/authorities/pages/AccountManage";
import RoleManage from "./common/authorities/pages/RoleManage";

// ERP 공통 페이지
import Home from "./common/Home";

// ERP 도메인
import BIPage from "./features/BI/pages/BIPage";
import PRBrowse from "./features/PR/pages/PrBrowse";
import OrderManagementPage from "./features/PR/pages/OrderManagementPage";
import RecommendPage from "./features/PR/pages/RecommendPage";
import ProductDetailPage from "./features/PR/pages/ProductDetailPage";
import ProductSearchPage from "./features/PR/pages/ProductSearchPage";
import ShopPage from "./features/PR/pages/ShopPage";
import POPage from "./features/PO/pages/POPage";
// import GRPage from "./features/GR/pages/GRPage";

// STK 도메인
import STKPage from "./features/STK/pages/STKPage";
import CurrentStockDashboard from "./features/STK/components/CurrentStockDashboard";
import ExpiryDashboard from "./features/STK/components/ExpiryDashboard";
import ExpiryManagementView from "./features/STK/components/ExpiryManagementView";
import StockAdjustmentView from "./features/STK/components/StockAdjustmentView";
import DisposalView from "./features/STK/components/DisposalView";

// POS 도메인
import POSDashboard from "./features/SD/pages/POSDashboard";
import SalesRegister from "./features/SD/pages/SalesRegister";



function App() {
  // ----------------------------------------------------
  // 🧭 라우트 구분용 정규식 (POS / ERP)
  // ----------------------------------------------------
  const POS_ROUTE = /^\/(sd)/;
  const ERP_ROUTE = /^\/(pr|po|gr|stk|bi)/;

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 초기 모드 결정 (현재 URL 기준)
  const [isPOS, setIsPOS] = useState(() => POS_ROUTE.test(location.pathname));

  // ----------------------------------------------------
  // ✅ 최근 방문 경로 저장 (POS ↔ ERP 모드 전환 시 복원용)
  // ----------------------------------------------------
  useEffect(() => {
    const path = location.pathname;

    if (POS_ROUTE.test(path)) {
      localStorage.setItem("lastPOSPath", path);
    } else if (path === "/" || ERP_ROUTE.test(path)) {
      localStorage.setItem("lastERPPath", path);
    }
  }, [location]);

  // ----------------------------------------------------
  // ✅ POS ↔ ERP 모드 전환
  // ----------------------------------------------------
  const togglePOS = () => {
    setIsPOS((prev) => {
      const next = !prev;
      const target = next
        ? localStorage.getItem("lastPOSPath") || "/sd" // ERP → POS
        : localStorage.getItem("lastERPPath") || "/";  // POS → ERP

      navigate(target);
      return next;
    });
  };

  // ✅ 현재 모드에 따른 메뉴 설정
  const menus = isPOS ? posMenus : stockMenus;

  // ----------------------------------------------------
  // 🧩 전역 Provider 통합 (QueryClient + Auth + Toast)
  // ----------------------------------------------------
  return (
    <RootProvider>
      {/* 상단 헤더 (POS/ERP 공용) */}
      <Header menus={menus} isPOS={isPOS} togglePOS={togglePOS} />

      {/* 메인 컨텐츠 영역 */}
      <main className="pt-16 px-4">
        <Routes>
          {/* ---------------------------------------------------- */}
          {/* 1. 공개 라우트 (로그인 필요 없음) */}
          {/* ---------------------------------------------------- */}
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} /> {/* 404 페이지 */}

          {/* ---------------------------------------------------- */}
          {/* 2. 보호 라우트 그룹 (로그인 필수) */}
          {/* ---------------------------------------------------- */}
          <Route element={<ProtectedRoute />}>
            {/* ERP 홈 */}
            <Route path="/" element={<Home />} />

            {/* 공통 메뉴 */}
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/account-manage" element={<AccountManage />} />
            <Route path="/role-manage" element={<RoleManage />} />

            {/* ---------------------------------------------------- */}
            {/* PR (상품/발주 추천) */}
            {/* ---------------------------------------------------- */}
            <Route path="/pr" element={<PRBrowse />} />
            <Route path="/pr/orders" element={<OrderManagementPage />} />
            <Route path="/pr/stores/:storeId/recommend" element={<RecommendPage />} />
            <Route path="/pr/detail/:gtin" element={<ProductDetailPage />} />
            <Route path="/pr/shop" element={<ShopPage />} />

            {/* ---------------------------------------------------- */}
            {/* PO (발주서 관리) */}
            {/* ---------------------------------------------------- */}
            <Route path="/po" element={<POPage />} />
            {/* <Route path="/gr" element={<GRPage />} /> */}

            {/* ---------------------------------------------------- */}
            {/* BI (경영 분석 / 예측) */}
            {/* ---------------------------------------------------- */}
            <Route path="/bi" element={<BIPage />} />
            <Route path="/bi/forecast" element={<div>예상 판매량</div>} />
            <Route path="/bi/kpi" element={<div>KPI 분석</div>} />
            <Route path="/bi/profit" element={<div>손익 분석</div>} />
            <Route path="/bi/order-efficiency" element={<div>발주 효율 분석</div>} />

            {/* ---------------------------------------------------- */}
            {/* STK (재고 / 창고 관리) */}
            {/* ---------------------------------------------------- */}
            <Route path="/stk" element={<STKPage />}>
              <Route index element={<CurrentStockDashboard />} />
              <Route path="current-status" element={<CurrentStockDashboard />} />
              <Route path="expiry" element={<ExpiryDashboard />} />
              <Route path="expiry-manage" element={<ExpiryManagementView />} />
              <Route path="adjust" element={<StockAdjustmentView />} />
              <Route path="disposal" element={<DisposalView />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* ---------------------------------------------------- */}
            {/* POS (판매 / 매출 관리) */}
            {/* ---------------------------------------------------- */}
            <Route path="/sd" element={<POSDashboard />} />
            <Route path="/sd/sales" element={<SalesRegister />} />
          </Route>
        </Routes>
      </main>
    </RootProvider>
  );
}

export default App;
