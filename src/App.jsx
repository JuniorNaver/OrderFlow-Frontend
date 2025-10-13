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
import OrderManagementPage from "./features/PR/pages/OrderManagementPage";
import RecommendListPage from "./features/PR/pages/RecommendListPage";
import ProductSearchPage from "./features/PR/pages/ProductSearchPage";
import ShopPage from "./features/PR/pages/ShopPage";
import POPage from "./features/PO/pages/POPage";
// import GRPage from "./features/GR/pages/GRPage";
// import STKPage from "./features/STK/pages/STKPage";

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
          <Route path="/pr" element={<PRPage />} />
          <Route path="/pr/orders" element={<OrderManagementPage />} /> 
          <Route path="/pr/recommend" element={<RecommendListPage />} />   
          <Route path="/pr/search" element={<ProductSearchPage />} />  
          <Route path="/pr/shop" element={<ShopPage />} />    
          <Route path="/po" element={<POPage />} />
          {/* <Route path="/gr" element={<GRPage />} /> */}
          {/* <Route path="/stk" element={<STKPage />} /> */}
          <Route path="/bi" element={<BIPage />} />
          <Route path="/bi/forecast" element={<div>예상 판매량</div>} />
          <Route path="/bi/kpi" element={<div>KPI 분석</div>} />
          <Route path="/bi/profit" element={<div>손익 분석</div>} />
          <Route path="/bi/order-efficiency" element={<div>발주 효율 분석</div>} />

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
