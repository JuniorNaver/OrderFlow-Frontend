// src/features/BI/components/BIDashboardApp.jsx
import "../styles/bi.css";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
import {
  fetchKpis,
  fetchSalesTrend,
  fetchCategorySales,
  fetchInventoryStatus,
} from "../api/biApi";

// ---------- Helpers ----------
function currencyKRW(n) {
  return n.toLocaleString("ko-KR");
}

// ---------- UI ----------
export default function BIDashboardApp() {
  return (
    <div className="bi min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">OrderFlow · BI 대시보드</h1>
          <span className="text-sm text-slate-500">v0.1 scaffold</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <FiltersBar />
        <KpiRow />
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <SalesTrendCard />
          <CategorySalesCard />
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <InventoryStatusCard />
          <NotesCard />
        </div>
      </main>
    </div>
  );
}

// ------------------ Filters ------------------
function useFilters() {
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const to = today.toISOString().slice(0, 10);
    const from = new Date(today.getTime() - 13 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    return { store: "SEOUL-001", from, to };
  });
  return { filters, setFilters };
}

// 전역 변수 방식 (간단한 상태 전달용)
let _filters = null;
let _setFilters = null;

function FiltersBar() {
  const { filters, setFilters } = useFilters();
  _filters = filters;
  _setFilters = setFilters;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">점포</label>
          <select
            className="mt-1 rounded-xl border-slate-300"
            value={filters.store}
            onChange={(e) =>
              setFilters((f) => ({ ...f, store: e.target.value }))
            }
          >
            <option value="SEOUL-001">서울 본점</option>
            <option value="BUSAN-002">부산 서면</option>
            <option value="JEJU-003">제주 공항</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">시작일</label>
          <input
            type="date"
            className="mt-1 rounded-xl border-slate-300"
            value={filters.from}
            onChange={(e) =>
              setFilters((f) => ({ ...f, from: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">종료일</label>
          <input
            type="date"
            className="mt-1 rounded-xl border-slate-300"
            value={filters.to}
            onChange={(e) =>
              setFilters((f) => ({ ...f, to: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">보기</label>
          <div className="flex gap-2 mt-1">
            <button
              className="px-3 py-2 rounded-xl border hover:shadow text-sm"
              onClick={() => refreshAll()}
            >
              새로고침
            </button>
            <button
              className="px-3 py-2 rounded-xl border hover:shadow text-sm"
              onClick={() => console.log("export csv (todo)")}
            >
              내보내기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function refreshAll() {
  // BI 전역 캐시 invalidate
  window.queryClient?.invalidateQueries({ queryKey: ["kpis"] });
  window.queryClient?.invalidateQueries({ queryKey: ["salesTrend"] });
  window.queryClient?.invalidateQueries({ queryKey: ["categorySales"] });
  window.queryClient?.invalidateQueries({ queryKey: ["inventoryStatus"] });
}

function useCurrentFilters() {
  return _filters || { store: "SEOUL-001", from: "", to: "" };
}

// ------------------ KPI Row ------------------
function KpiRow() {
  const filters = useCurrentFilters();
  const { data, isLoading } = useQuery({
    queryKey: ["kpis", filters],
    queryFn: () => fetchKpis(filters),
  });

  if (isLoading || !data) {
    return (
      <div className="grid md:grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 skeleton" />
        ))}
      </div>
    );
  }

  return (
    <section className="grid md:grid-cols-4 gap-4 mt-6">
      <KpiCard
        label="매출"
        value={`${currencyKRW(data.totalSales)}원`}
        hint="기간 총합"
      />
      <KpiCard
        label="거래건수"
        value={currencyKRW(data.orders)}
        hint="기간 총합"
      />
      <KpiCard
        label="객단가"
        value={`${currencyKRW(data.avgBasket)}원`}
        hint="매출/거래건수"
      />
      <KpiCard
        label="재고회전율"
        value={`${data.inventoryTurn.toFixed(1)}회`}
        hint="12개월 롤링"
      />
    </section>
  );
}

function KpiCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col items-center text-center">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

// ------------------ Sales Trend ------------------
function SalesTrendCard() {
  const filters = useCurrentFilters();
  const { data, isLoading } = useQuery({
    queryKey: ["salesTrend", filters],
    queryFn: () => fetchSalesTrend(filters),
  });

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-base font-semibold text-center">일자별 매출 & 예측</h2>
      <div className="h-[280px] mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data || []}
            margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(v) => `${currencyKRW(v)}원`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              name="실매출"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="예측"
              dot={false}
              strokeDasharray="4 4"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {isLoading && (
        <div className="text-sm text-slate-400 text-center">로딩 중…</div>
      )}
    </article>
  );
}

// ------------------ Category Sales ------------------
function CategorySalesCard() {
  const filters = useCurrentFilters();
  const { data, isLoading } = useQuery({
    queryKey: ["categorySales", filters],
    queryFn: () => fetchCategorySales(filters),
  });

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-base font-semibold text-center">카테고리별 매출</h2>
      <div className="h-[280px] mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data || []}
            margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(v) => `${currencyKRW(v)}원`} />
            <Bar dataKey="sales" name="매출" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {isLoading && (
        <div className="text-sm text-slate-400 text-center">로딩 중…</div>
      )}
    </article>
  );
}

// ------------------ Inventory Status ------------------
function InventoryStatusCard() {
  const filters = useCurrentFilters();
  const { data, isLoading } = useQuery({
    queryKey: ["inventoryStatus", filters],
    queryFn: () => fetchInventoryStatus(filters),
  });

  const total = useMemo(
    () => (data ? data.reduce((a, b) => a + b.value, 0) : 0),
    [data]
  );

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-base font-semibold text-center">재고 상태 분포</h2>
      <div className="h-[280px] mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="value"
              nameKey="name"
              data={data || []}
              outerRadius={90}
              label
            >
              {(data || []).map((_, i) => (
                <Cell key={i} />
              ))}
            </Pie>
            <Legend />
            <Tooltip
              formatter={(v) =>
                `${v}건 (${total ? Math.round((v / total) * 100) : 0}%)`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {isLoading && (
        <div className="text-sm text-slate-400 text-center">로딩 중…</div>
      )}
    </article>
  );
}

// ------------------ Notes ------------------
function NotesCard() {
  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-base font-semibold text-center">메모 & 액션</h2>
      <ul className="mt-2 text-sm list-disc pl-5 space-y-1 text-slate-700">
        <li>예측값은 공공데이터(날씨/관광) + 과거 실적 + 재고 한도를 반영합니다.</li>
        <li>임계치 근접/유통기한 임박 재고는 재고관리 화면과 연결 예정.</li>
        <li>필터 변경 시 서버 상태는 React Query로 자동 캐싱/리페치됩니다.</li>
      </ul>
      <div className="mt-3 flex gap-2">
        <button
          className="px-3 py-2 rounded-xl border hover:shadow text-sm"
          onClick={() => alert("발주 추천 (TODO)")}
        >
          발주 추천
        </button>
        <button
          className="px-3 py-2 rounded-xl border hover:shadow text-sm"
          onClick={() => alert("보고서 내보내기 (TODO)")}
        >
          보고서 내보내기
        </button>
      </div>
    </article>
  );
}
