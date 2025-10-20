import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./common/authorities/component/AuthProvider"; 
import "./styles/App.css";



// 공용 페이지
import Home from "./common/Home";
import Login from "./common/authorities/pages/Login";
import MyPage from "./common/authorities/pages/MyPage";
import AccountManage from "./common/authorities/pages/AccountManage";
import RoleManage from "./common/authorities/pages/RoleManage";
import ProtectedRoute from "./common/authorities/component/ProtectedRoute";
import NotFound from "./components/error/NotFound";

// ERP 도메인
import BIPage from "./features/BI/pages/BIPage";
import PRPage from "./features/PR/pages/PRPage";
import OrderManagementPage from "./features/PR/pages/OrderManagementPage";
import RecommendListPage from "./features/PR/pages/RecommendListPage";
import ProductSearchPage from "./features/PR/pages/ProductSearchPage";
import ShopPage from "./features/PR/pages/ShopPage";
import POPage from "./features/PO/pages/POPage";
// import GRPage from "./features/GR/pages/GRPage";

import STKPage from "./features/STK/pages/STKPage";
import STKHome from "./features/STK/components/STKHome";
import CurrentStockDashboard from "./features/STK/components/CurrentStockDashboard";
import ExpiryDashboard from "./features/STK/components/ExpiryDashboard";
import ExpiryManagementView from "./features/STK/components/ExpiryManagementView";
import StockAdjustmentView from "./features/STK/components/StockAdjustmentView";
import DisposalView from "./features/STK/components/DisposalView";

// ---------------------- POS 도메인 ----------------------
import POSDashboard from "./features/SD/pages/POSDashboard";
import SalesRegister from "./features/SD/pages/SalesRegister";

// 전역 UI
import Header from "./components/Header";

// 메뉴 데이터
import posMenus from "./components/menus/posMenus";
import stockMenus from "./components/menus/stockMenus";
import PRBrowse from "./features/PR/pages/PrBrowse";
import ProductDetailPage from "./features/PR/pages/ProductDetailPage";


// React Query Client (전역)
const queryClient = new QueryClient();

function App() {
  // 정규식 상수
  const POS_ROUTE = /^\/(sd)/;
  const ERP_ROUTE = /^\/(pr|po|gr|stk|bi)/;

  const navigate = useNavigate();
  const location = useLocation();
  // ✅ 초기값을 현재 경로로 설정
  const [isPOS, setIsPOS] = useState(() => POS_ROUTE.test(location.pathname));




  // 현재 경로를 localStorage에 저장
  useEffect(() => {
    const path = location.pathname;

    if (POS_ROUTE.test(path)) {
      localStorage.setItem("lastPOSPath", path);
    } else if (path === "/" || ERP_ROUTE.test(path)) {
      localStorage.setItem("lastERPPath", path);
    }
  }, [location]);

  // 모드 전환
  const togglePOS = () => {
    setIsPOS((prev) => {
      const next = !prev;

      if (next) {
        // ERP → POS
        const lastPOS = localStorage.getItem("lastPOSPath");
        navigate(lastPOS || "/sd"); // 초기: 대시보드, 이후: 마지막 POS
      } else {
        // POS → ERP
        const lastERP = localStorage.getItem("lastERPPath");
        navigate(lastERP || "/"); // 초기: 홈, 이후: 마지막 ERP
      }

      return next;
    });
  };


  // 현재 모드에 따른 메뉴
  const menus = isPOS ? posMenus : stockMenus;

  return (
        <QueryClientProvider client={queryClient}>
            {/* AuthProvider로 전체를 감싸서 어디서든 useAuth를 사용할 수 있도록 합니다. */}
            <AuthProvider>
                <Header menus={menus} isPOS={isPOS} togglePOS={togglePOS} />

                <main className="pt-16 px-4">
                    <Routes>
                        
                        {/* ---------------------------------------------------- */}
                        {/* 2. 공개 라우트 (인증 없이 접근 가능) */}
                        {/* ---------------------------------------------------- */}
                        <Route path="/login" element={<Login />} />
                        <Route path="*" element={<NotFound />} /> {/* 404 페이지는 공개 */}

                        
                        {/* ---------------------------------------------------- */}
                        {/* 3. 보호된 라우트 그룹 (로그인 필수) */}
                        {/* ---------------------------------------------------- */}
                        {/* 🚨 ProtectedRoute로 모든 업무 페이지를 감싸서 접근을 제어합니다. */}
                        <Route element={<ProtectedRoute />}> 
                            
                            {/* ERP 홈 대시보드 */}
                            <Route path="/" element={<Home />} />
                            
                            {/* 공용 (보호 필요) */}
                            <Route path="/mypage" element={<MyPage />} />
                            <Route path="/account-manage" element={<AccountManage />} />
                            <Route path="/role-manage" element={<RoleManage />} />

                            {/* ERP 도메인 */}
                            <Route path="/pr" element={<PRBrowse />} />
                            <Route path="/pr/orders" element={<OrderManagementPage />} />
                            <Route path="/pr/recommend" element={<RecommendListPage />} />
                            <Route path="/pr/detail/:gtin" element={<ProductDetailPage />} />
                            <Route path="/pr/shop" element={<ShopPage />} />
                            <Route path="/po" element={<POPage />} />
                            {/* <Route path="/gr" element={<GRPage />} /> */}


                            <Route path="/bi" element={<BIPage />} />
                            <Route path="/bi/forecast" element={<div>예상 판매량</div>} />
                            <Route path="/bi/kpi" element={<div>KPI 분석</div>} />
                            <Route path="/bi/profit" element={<div>손익 분석</div>} />
                            <Route path="/bi/order-efficiency" element={<div>발주 효율 분석</div>} />


                            {/* STK 라우트 블록 */}
                            <Route path="/stk" element={<STKPage />}>
                                <Route index element={<CurrentStockDashboard />} />
                                <Route path="current-status" element={<CurrentStockDashboard />} />
                                <Route path="expiry" element={<ExpiryDashboard />} />
                                <Route path="expiry-manage" element={<ExpiryManagementView />} />
                                <Route path="adjust" element={<StockAdjustmentView />} />
                                <Route path="disposal" element={<DisposalView />} />
                                <Route path="*" element={<NotFound />} />
                            </Route>

                            {/* POS 도메인 */}
                            <Route path="/sd" element={<POSDashboard />} />
                            <Route path="/sd/sales" element={<SalesRegister />} />

                        </Route>
                        {/* /ProtectedRoute 종료 */}
                        
                        {/* 404 라우트는 ProtectedRoute 밖에 두는 것이 좋습니다. 이미 위에서 처리됨 */}
                        {/* <Route path="*" element={<NotFound />} /> */}
                    </Routes>
                </main>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
