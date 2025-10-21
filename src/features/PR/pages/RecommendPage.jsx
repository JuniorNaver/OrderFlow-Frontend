import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getRecommend } from "../api/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCategories } from "../api/browse";
import { fetchCategorySales } from "../../BI/api/biApi";


const ZONES = [
  { key: "room", label: "실온" },
  { key: "chilled", label: "냉장" },
  { key: "frozen", label: "냉동" },
  { key: "other", label: "기타" },
];

 // 서버 StorageMethod → 프론트 zone key 매핑
 function mapStorageMethodToZone(sm) {
   switch (sm) {
     case "ROOM_TEMP": return "room";
     case "COLD":      return "chilled";
     case "FROZEN":    return "frozen";
     case "OTHER":     return "other";
     default:          return "room";
   }
}


export default function RecommendPage() {
  const { storeId = "" } = useParams();
  const nav = useNavigate();

  const { data: catSales, isLoading: catLoading } = useQuery({
  queryKey: ["bi-cat-sales", storeId],
  queryFn: () => fetchCategorySales({ storeId }),
  staleTime: 60_000,
});

  // Top3 카테고리 구하기
  const topCats = useMemo(() => {
    const arr = catSales ?? [];
    return arr
    .slice()
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3)
    .map((c) => c.category);  // 음료, 스낵, 즉석식품 같은 형태
  }, [catSales]);

  // 선택 상태: Map<productCode, { ...item, qty }>
  const [picked, setPicked] = useState(() => new Map());
  const [zone, setZone] = useState("room"); // 기본 탭

  // ✅ zone / topCats를 서버로 넘겨서 필터링 맡기기
 const q = useQuery({
   queryKey: ["recommend", storeId, zone, topCats], // 파라미터가 바뀌면 자동 리패치
   queryFn: () => getRecommend(storeId, {
     categories: topCats,       // ["음료","스낵",...]
     zone,                      // "room"|"chilled"|...
     limitPerCategory: 3,
   }),
   enabled: !!storeId,
   retry: 0,
 });

// ✅ 서버 storageMethod를 프론트 zone으로 보정
 const items = (q.data?.items ?? []).map(it => ({
   ...it,
   zone: mapStorageMethodToZone(it.storageMethod) // (이제 it.zone 없으면 여기서 보정)
 }));
  // 서버가 이미 zone/카테고리로 필터했지만, 방어적으로 한 번 더 필터
 const filtered = useMemo(() => {
   const base = zone ? items.filter((it) => it.zone === zone) : items;
   if (!topCats.length) return base;
   const res = base.filter((it) => topCats.includes(it.category));
   return res.length ? res : base;
 }, [items, zone, topCats]);

  

  const handlePick = useCallback((item, qty) => {
    setPicked((prev) => {
      const next = new Map(prev);
      const safeQty = Math.max(1, Math.floor(Number(qty || item.suggestedQty || 1)));
      next.set(item.productCode, { ...item, qty: safeQty });
      return next;
    });
  }, []);

  const handleUnpick = useCallback((productCode) => {
    setPicked((prev) => {
      const next = new Map(prev);
      next.delete(productCode);
      return next;
    });
  }, []);

  const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

  const summary = useMemo(() => {
    let count = 0;
    let amount = 0;
    for (const [, v] of picked) {
      count += 1;
      amount += toNumber(v.unitPrice ?? 0) * toNumber(v.qty);
    }
    return { count, amount };
  }, [picked]);

  const zoneCounts = useMemo(() => {
    const base = !topCats.length ? items : items.filter(it => topCats.includes(it.category));
   const m = { room:0, chilled:0, frozen:0, other:0 };
   for (const it of base) m[it.zone] = (m[it.zone] ?? 0) + 1;
   return m;
}, [items, topCats]);

  const goToPO = useCallback(() => {
    // 배열로 변환해서 내보내기
    const items = Array.from(picked.values()).map(({ productCode, qty }) => ({
      productCode,
      qty,
    }));
    nav("/po", { state: { from: "recommend", storeId, items } });
  }, [picked, nav, storeId]);

  if (q.isLoading) return <div className="p-6">불러오는 중…</div>;
  if (q.isError) return <div className="p-6 text-red-600">추천 데이터를 불러올 수 없습니다.</div>;
  if (!items.length) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">추천 발주</h1>
        <p className="text-gray-600">추천 결과가 없습니다. 최근 발주 내역으로 채워볼까요?</p>
        {/* 필요 시: 최근 발주 불러오기 버튼 */}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">추천 발주</h1>
        <div className="flex gap-2 items-center">
          {topCats.length > 0 && (
      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
        기준: Top3 카테고리 {topCats.join(" · ")}
      </span>
    )}
          {ZONES.map((z) => (
            <button
              key={z.key}
              aria-pressed={zone === z.key}
              className={`px-3 py-1 rounded-full border ${zone === z.key ? "bg-gray-900 text-white" : "bg-white"}`}
              onClick={() => setZone(z.key)}
        >
          {z.label} ({zoneCounts[z.key] || 0})
        </button>
      ))}
        </div>
      </header>

      <section className="grid gap-3">
        {filtered.map((it) => (
          <RecommendCard
            key={it.productCode}
            item={it}
            selected={picked.has(it.productCode)}
            defaultQty={picked.get(it.productCode)?.qty ?? it.suggestedQty ?? 1}
            onPick={handlePick}
            onUnpick={() => handleUnpick(it.productCode)}
          />
        ))}
      </section>

      <Footer
        count={summary.count}
        amount={summary.amount}
        onConfirm={goToPO}
        disabled={summary.count === 0}
        onPickAll={() => {
          const next = new Map();
          for (const it of filtered) {
            next.set(it.productCode, { ...it, qty: it.suggestedQty ?? 1 });
          }
          setPicked((prev) => new Map([...prev, ...next]));
        }}
        onClear={() => setPicked(new Map())}
      />
    </div>
  );
}

function RecommendCard({ item, defaultQty, selected, onPick, onUnpick }) {
  const [qty, setQty] = useState(defaultQty);
  useEffect(() => { setQty(defaultQty); }, [defaultQty]);  // 동기화

  useEffect(() => {
    if (selected) onPick(item, qty);
  }, [selected, qty, item, onPick]);
  const inc = () => setQty((v) => Math.max(1, (v || 1) + 1));
  const dec = () => setQty((v) => Math.max(1, (v || 1) - 1));

  return (
    <div className="rounded-xl border p-3 flex items-start justify-between">
      <div className="space-y-1">
        <div className="font-medium">{item.productName}</div>
        <div className="text-sm text-gray-600">
          제안 {item.suggestedQty ?? "-"}개 · 단가 {fmtWon(item.unitPrice)}
        </div>
        {item.reason && (
          <div className="text-xs text-gray-500">사유: {item.reason}</div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
          <button onClick={dec} aria-label="decrement">−</button>
          <input
          type="number" inputMode="numeric" min={1}
            className="w-12 text-center outline-none"
            value={qty}
            onChange={(e) => {
              const n = Math.floor(Number(e.target.value));
              setQty(Number.isFinite(n) && n > 0 ? n : 1);
            }}
            onBlur={() => setQty((v) => (v && v > 0 ? v : 1))}
          />
          <button onClick={inc} aria-label="increment">＋</button>
        </div>

        {selected ? (
          <button className="px-3 py-1 rounded-lg border" onClick={onUnpick}>
            해제
          </button>
        ) : (
          <button
            className="px-3 py-1 rounded-lg bg-gray-900 text-white"
            onClick={() => onPick(item, qty)}
          >
            담기
          </button>
        )}
      </div>
    </div>
  );
}

function Footer({ count, amount, onConfirm, disabled, onPickAll, onClear }) {
  return (
    <footer className="sticky bottom-0 left-0 right-0 z-0 bg-white/95 backdrop-blur border-t p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] flex items-center justify-between">
      <div className="text-sm text-gray-700">
        담긴 항목 <b>{count}</b> • 예상 매입액 <b>{fmtWon(amount)}</b>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded-lg border" onClick={onPickAll}>
          화면 전체 담기
        </button>
        <button className="px-3 py-1 rounded-lg border" onClick={onClear}>
          비우기
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${disabled ? "bg-gray-300" : "bg-blue-600 text-white"}`}
          onClick={onConfirm}
          disabled={disabled}
        >
          발주로 이동
        </button>
      </div>
    </footer>
  );
}

function fmtWon(v) {
  if (v == null) return "—";
  try {
    return Number(v).toLocaleString("ko-KR") + "원";
  } catch {
    return "—";
  }
}