import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/App.css";

// 공용 페이지
import Home from "./common/pages/Home";
import Login from "./common/pages/Login";
import NotFound from "./common/components/NotFound";

// ERP 도메인
import BIPage from "./features/BI/pages/BIPage";
import PRPage from "./features/PR/pages/PRPage";
import POPage from "./features/PO/pages/POPage";
// import GRPage from "./features/GR/pages/GRPage";

import STKPage from "./features/STK/pages/STKPage";
import STKHome from "./features/STK/components/STKHome";
import CurrentStockDashboard from "./features/STK/components/CurrentStockDashboard";
import ExpiryDashboard from "./features/STK/components/ExpiryDashboard";
import ExpiryManagementView from "./features/STK/components/ExpiryManagementView";
import StockAdjustmentView from "./features/STK/components/StockAdjustmentView";
import DisposalView from "./features/STK/components/DisposalView";

// POS 도메인
import POSDashboard from "./features/SD/pages/POSDashboard";
import SalesRegister from "./features/SD/pages/SalesRegister";

// 전역 UI
import Header from "./components/Header";

// 메뉴 데이터
import posMenus from "./menus/posMenus";
import stockMenus from "./menus/stockMenus";

// React Query Client (전역)
const queryClient = new QueryClient();

function App() {
  const [isPOS, setIsPOS] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 정규식 상수
  const POS_ROUTE = /^\/(sd)/;
  const ERP_ROUTE = /^\/(pr|po|gr|stk|bi)/;

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
      <Header menus={menus} isPOS={isPOS} togglePOS={togglePOS} />

      <main className="pt-16 px-4">
        <Routes>
          {/* 공용 */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* ERP 도메인 */}
          <Route path="/pr/*" element={<PRPage />} />
          <Route path="/po" element={<POPage />} />
          {/* <Route path="/gr" element={<GRPage />} /> */}
         
          
           {/* 💡 STK 라우트 블록: index 경로 변경 */}
          <Route path="/stk" element={<STKPage />}>
                
                {/* 1. 💡 [수정] 인덱스 경로: /stk 접속 시, CurrentStockDashboard를 바로 렌더링 */}
            <Route index element={<CurrentStockDashboard />} /> 
            
            {/* 2. 재고 현황 조회 (기존 경로는 그대로 유지. 이제 인덱스와 동일한 화면) */}
            <Route path="current-status" element={<CurrentStockDashboard />} />
            
            {/* 3. 유통기한 현황 */}
            <Route path="expiry" element={<ExpiryDashboard />} />
            
            {/* 4. 유통기한 임박 상품 관리 */}
            <Route path="expiry-manage" element={<ExpiryManagementView />} />
            
            {/* 5. 재고 수량 조정 */}
            <Route path="adjust" element={<StockAdjustmentView />} />
            {/* 5. 폐기 */}
            <Route path="disposal" element={<DisposalView />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* POS 도메인 */}
          <Route path="/sd" element={<POSDashboard />} />
          <Route path="/sd/sales" element={<SalesRegister />} /> 

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </QueryClientProvider>
  );
}

export default App;
