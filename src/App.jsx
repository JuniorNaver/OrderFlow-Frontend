import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/App.css";

// 공용 페이지
import Home from "./common/pages/Home";
import Login from "./common/pages/Login";
import NotFound from "./common/components/NotFound";

// 도메인별 페이지
// import PRPage from "./features/PR/pages/PRPage";
// import POPage from "./features/PO/pages/POPage";
// import GRPage from "./features/GR/pages/GRPage";
// import STKPage from "./features/STK/pages/STKPage";
// import SDPage from "./features/SD/pages/SDPage";
import BIPage from "./features/BI/pages/BIPage";

// POS (SD 메인 + 세분화)
import POSDashboard from "./features/SD/pages/POSDashboard";
// import Payment from "./features/SD/pages/Payment";
// import Refund from "./features/SD/pages/Refund";
// import Sales from "./features/SD/pages/Sales";
// import Receipt from "./features/SD/pages/Receipt";

// 전역 UI
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <Header />
      {/* 헤더 높이만큼 아래로 밀어주기 */}
      <main className="pt-16 px-4">
        <Routes>
          {/* 공용 */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* 도메인 */}
          {/* <Route path="/pr" element={<PRPage />} /> */}
          {/* <Route path="/po" element={<POPage />} /> */}
          {/* <Route path="/gr" element={<GRPage />} /> */}
          {/* <Route path="/stk" element={<STKPage />} /> */}
          {/* <Route path="/sd" element={<SDPage />} /> */}
          <Route path="/bi" element={<BIPage />} />

          {/* POS (SD 메인 + 세분화) */}
          <Route path="/sd" element={<POSDashboard />} />
          {/* <Route path="/sd/payment" element={<Payment />} />
        <Route path="/sd/refund" element={<Refund />} />
        <Route path="/sd/sales" element={<Sales />} />
        <Route path="/sd/receipt" element={<Receipt />} /> */}

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
