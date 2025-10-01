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
// import BIPage from "./features/BI/pages/BIPage";

// 전역 UI
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* 공용 */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* 도메인 */}
        {/* <Route path="/pr" element={<PRPage />} />
        <Route path="/po" element={<POPage />} />
        <Route path="/gr" element={<GRPage />} />
        <Route path="/stk" element={<STKPage />} />
        <Route path="/sd" element={<SDPage />} />
        <Route path="/bi" element={<BIPage />} /> */}

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
