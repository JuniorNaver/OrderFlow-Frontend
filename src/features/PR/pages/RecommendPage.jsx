import { useQueries, useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getRecommend } from "../api/api";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCategorySales } from "../../BI/api/biApi";
import { reserve, fetchAvailable } from "../api/browse";
import { usePOApi } from "../../PO/api/poApi";
import { toastBus } from "../../../common/utils/ToastBus";


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
  const { createPO } = usePOApi();
  const [poId, setPoId] = useState(() => {
    try{ return localStorage.getItem("poId"); } catch { return null; }
  });
  const [addingMap, setAddingMap] = useState({});
  const [availableByCode, setAvailableByCode] = useState({});

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


  // 1) catSales가 준비되기 전엔 categories를 보내지 않는다
const catsReady = topCats.length > 0;


// 공통 파라미터 (카테고리/limit만)
const baseParams = useMemo(() => ({
  limitPerCategory: 3,
  categories: catsReady ? topCats : undefined,
}), [catsReady, topCats]);

// zones별 병렬 쿼리
const zoneQueries = useQueries({
  queries: ZONES.map(({ key }) => ({
    queryKey: ["recommend", storeId, key, catsReady ? topCats.join("|") : "no-cats"],
    queryFn: () => getRecommend(storeId, { ...baseParams, zones: [key] }),
    enabled: !!storeId,              // 필요하면 && catsReady 로 더 지연 가능
    keepPreviousData: true,
    retry: 0,
  })),
});

// 활성 탭 데이터만 리스트로 사용
const activeIdx = ZONES.findIndex(z => z.key === zone);
const activeData = zoneQueries[activeIdx]?.data;

// ✅ 서버 storageMethod를 프론트 zone으로 보정
 const items = (activeData?.items ?? []).map(it => ({
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

 useEffect(() => {
  if (!filtered.length) {
    setAvailableByCode({});
    return;
  }
  let aborted = false;
  (async () => {
    try {
      const pairs = await Promise.all(
        filtered.map(async (it) => {
          const inv = await fetchAvailable(it.productCode);
          return [it.productCode, inv?.available ?? 0];
        })
      );
      if (!aborted) setAvailableByCode(Object.fromEntries(pairs));
    } catch {
      // 필요하면 toastBus.emit("재고 조회 실패", "error");
    }
  })();
  return () => { aborted = true; };
}, [filtered]);

  

  const handlePick = useCallback((item, qty) => {
    setPicked((prev) => {
      const safeQty = Math.max(1, Math.floor(Number(qty || item.suggestedQty || 1)));
   const prevRow = prev.get(item.productCode);
   if (prevRow && prevRow.qty === safeQty) {
     return prev; // 변화 없음 → 리렌더 스킵
   }
   const next = new Map(prev);
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
  const m = { room:0, chilled:0, frozen:0, other:0 };
  ZONES.forEach((z, i) => {
    const data = zoneQueries[i]?.data;
    const list = (data?.items ?? []).map(it => ({
      ...it,
      zone: mapStorageMethodToZone(it.storageMethod),
    }));
    const base = topCats.length ? list.filter(it => topCats.includes(it.category)) : list;
    m[z.key] = base.length;
  });
  return m;
}, [zoneQueries, topCats]);

// import, state 다 되어있으니 이 콜백만 추가
const addToCart = useCallback(async (item, qty) => {
  const productCode = item.productCode;
  const orderQty = Math.max(1, Math.floor(Number(qty || item.suggestedQty || 1)));

  setAddingMap(m => ({ ...m, [productCode]: true }));
  const prevAvail = availableByCode[productCode] ?? 0;

  try {
    // 1) 예약
    await reserve(productCode, orderQty);

    // 2) PO 라인 생성 (기존 poId 재사용)
    const res = await createPO({ poId, gtin: productCode, orderQty });
    const newId = res?.poId ?? res?.id ?? res?.data?.poId ?? res?.data?.id;
    if (!poId && newId) {
      setPoId(newId);
      try { localStorage.setItem("poId", String(newId)); } catch {}
    }

    // 3) 낙관적 가용 차감
    setAvailableByCode(m => ({
      ...m,
      [productCode]: Math.max(0, (m[productCode] ?? prevAvail) - orderQty),
    }));

    // 4) (선택) 이미 선택된 항목이면 수량을 가용 한도로 보정
    setPicked(prev => {
      if (!prev.has(productCode)) return prev;
      const row = prev.get(productCode);
      const nextAvail = Math.max(0, prevAvail - orderQty);
      const safeQty = Math.min(row.qty, Math.max(1, nextAvail));
      if (safeQty === row.qty) return prev;
      const next = new Map(prev);
      next.set(productCode, { ...row, qty: safeQty });
      return next;
    });

    toastBus.emit(`${item.productName ?? productCode} ${orderQty}개 담았습니다`, "success");
  } catch (e) {
    console.error("추천 담기 실패:", e);
    toastBus.emit(e?.message ?? "장바구니 추가 중 오류가 발생했습니다 ❌", "error");
  } finally {
    setAddingMap(m => ({ ...m, [productCode]: false }));
    // 5) 서버 진실값으로 단건 재동기화
    try {
      const inv = await fetchAvailable(productCode);
      setAvailableByCode(m => ({ ...m, [productCode]: inv?.available ?? 0 }));
    } catch {}
  }
}, [poId, createPO, availableByCode]);

  return (
    <div className="relative z-0 p-4 space-y-4"
      style={{ isolation: 'isolate'}} // 이 페이지 범위만 스택격리
    >
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
            onAdd={(qty) => addToCart(it, qty)}
            available={availableByCode[it.productCode] ?? 0}
            adding={!!addingMap[it.productCode]}
          />
        ))}
      </section>
    </div>
  );
}

const RecommendCard = React.memo(function RecommendCard({ item, defaultQty, selected, onPick, onUnpick, onAdd, available = 0 , adding = false }) {
  const [qty, setQty] = useState(defaultQty);
  useEffect(() => { 
    setQty(prev => (prev === defaultQty ? prev : defaultQty));
 }, [defaultQty]);


  useEffect(() => {
   if (!selected) return;
   onPick(item, qty);
   // item 전체가 아니라 제품 키만 의존
 }, [selected, qty, item.productCode]);
  const inc = () => setQty((v) => Math.max(1, (v || 1) + 1));
  const dec = () => setQty((v) => Math.max(1, (v || 1) - 1));

  // 선택 수량을 가용 한도 내로 보정 (UI 방어)
 const clampedQty = Math.min(qty, Math.max(available, 0) || 1);
 useEffect(() => {
   if (qty !== clampedQty) setQty(clampedQty);
   // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [available]);

  

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
        <div className="text-xs text-gray-500">
         가용재고: {Number.isFinite(available) ? available : 0}개
       </div>
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
            cclassName="px-3 py-1 rounded-lg bg-gray-900 text-white disabled:opacity-50"
            disabled={adding || (available ?? 0) <= 0}
            onClick={() => onAdd(qty)}
          >
            담기
            {adding ? "담는 중..." : (available <= 0 ? "품절" : "담기")}
          </button>
        )}
      </div>
    </div>
  );
});



function fmtWon(v) {
  if (v == null) return "—";
  try {
    return Number(v).toLocaleString("ko-KR") + "원";
  } catch {
    return "—";
  }
}