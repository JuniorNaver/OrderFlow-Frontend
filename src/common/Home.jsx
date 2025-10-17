import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
// 🔥 BI 모듈 fetch 함수 (지금은 더미데이터, 나중에 API로 교체)
import { fetchSalesTrend } from "../features/BI/api/biApi";

// ---------- Helpers ----------
function currencyKRW(n) {
  return n.toLocaleString("ko-KR");
}

export default function Home() {
  // ✅ React Query: BI 매출 추세 (캐시 공유 가능)
  const { data: biTrend, isLoading } = useQuery({
    queryKey: ["salesTrend", { context: "home" }],
    queryFn: () => fetchSalesTrend({}), 
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🏠 ERP 홈 대시보드
      </h2>
      <p className="text-gray-700 mb-8">
        발주, 입고, 재고, BI 분석 기능을 한눈에 확인하고 각 메뉴로 이동하세요.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        
        {/* 📝 발주 카드 (PR/PO) */}
        <Link
          to="/pr"
          className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition block"
        >
          <h3 className="font-semibold text-lg mb-3">📝 발주 (PR/PO)</h3>
          <p className="text-sm text-gray-600">
            최근 발주 요청: <b>5건</b>, 확정 대기: <b>2건</b>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            마지막 발주일: 2025-09-30
          </p>
        </Link>

        {/* 📦 입고 카드 (GR) */}
        <Link
          to="/gr"
          className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition block"
        >
          <h3 className="font-semibold text-lg mb-3">📦 입고 (GR)</h3>
          <p className="text-sm text-gray-600">오늘 입고: <b>15건</b></p>
          <p className="text-xs text-gray-500 mt-2">최근 입고: 2025-09-30</p>
        </Link>

        {/* 📊 재고 카드 (STK) */}
        <Link
          to="/stk"
          className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition block"
        >
          <h3 className="font-semibold text-lg mb-3">📊 재고 (STK)</h3>
          <p className="text-sm text-gray-600">
            총 재고 품목: <b>120</b>, 유통기한 임박: <b>8건</b>
          </p>
        </Link>

        {/* 📈 BI 카드 (API 연동 대비) */}
        <Link
          to="/bi"
          className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition block"
        >
          <h3 className="font-semibold text-lg mb-3">📈 BI 분석</h3>
          <p className="text-sm text-gray-600 mb-4">최근 매출 추세</p>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={biTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip formatter={(v) => `${currencyKRW(v)}원`} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  name="실매출"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 4"
                  name="예측"
                />
              </LineChart>
            </ResponsiveContainer>
            {isLoading && (
              <div className="text-xs text-slate-400 text-center mt-2">
                로딩 중…
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
