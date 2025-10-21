import React, {useEffect, useState, useRef, useCallback} from "react";
import { Sun, Refrigerator, Snowflake, PackageOpen } from "lucide-react";
import { fetchCorners, fetchCategories, fetchProducts, fetchAvailable, reserve } from "../api/browse";
import { Link } from "react-router-dom";
import {createPO} from "../../PO/api/poApi"

const ZONES = [
  { key: "room",    label: "실온", icon: <Sun className="h-5 w-5" /> },
  { key: "chilled", label: "냉장", icon: <Refrigerator className="h-5 w-5" /> },
  { key: "frozen",  label: "냉동", icon: <Snowflake className="h-5 w-5" /> },
  { key: "other",   label: "기타", icon: <PackageOpen className="h-5 w-5" /> },
];

const slug = (s) => (s || "").trim().replace(/\s+/g, "_");
const unslug = (s) => (s || "").replace(/_/g, " ");

export default function PRBrowse() {
  const [zone, setZone] = useState("room");     // 내부값은 영문 키 권장
  const [corners, setCorners] = useState([]);   // [{id,name,categoryCount}]
  const [kans, setKans] = useState([]);         // [{id,name,childrenCount}]
  const [cornerId, setCornerId] = useState(null);
  
  // 상품 관련
  const [products, setProducts] = useState([]);
  const [availableByGtin, setAvailableByGtin] = useState({}); // { [gtin]: number }
  const [adding, setAdding] = useState({});                    // { [gtin]: boolean }
  const [toast, setToast] = useState(null);                    // 가벼운 알림 
  const [loadingCorners, setLoadingCorners] = useState(false);
  const [loadingKans, setLoadingKans] = useState(false);
  const [loadingProds, setLoadingProds] = useState(false);
  const [error, setError] = useState(null);
  const [qtyByGtin, setQtyByGtin] = useState({});

  const toastTimerRef = useRef(null);
  const showToast = useCallback((msg, duration = 1500) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  useEffect(() => {
    return () => { // 언마운트 시 타이머 정리
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // 존 변경 → 코너 로드
  useEffect(() => {
    let abort = false;
    setLoadingCorners(true);
    setCornerId(null);
    setKans([]);
    setProducts([]);
    setError(null);

    fetchCorners(zone)
      .then(data => { if (!abort) setCorners(data); })
      .catch(e => { if (!abort) { setCorners([]); setError(e.message); } })
      .finally(() => { if (!abort) setLoadingCorners(false); });

    return () => { abort = true; };
  }, [zone]);

  // 코너 선택 → KAN 로드
  useEffect(() => {
    if (!cornerId) return;
    let abort = false;
    setLoadingKans(true);
    setKans([]);
    setProducts([]);
    setError(null);

    fetchCategories(zone, cornerId)
      .then(data => { if (!abort) setKans(data); })
      .catch(e => { if (!abort) { setKans([]); setError(e.message); } })
      .finally(() => { if (!abort) setLoadingKans(false); });

    return () => { abort = true; };
  }, [zone, cornerId]);

  // KAN 클릭 → 상품 로드
  async function onClickKan(kanCode) {
    setLoadingProds(true);
    setProducts([]);
    setError(null);
    try {
      const data = await fetchProducts(kanCode, 0, 20);
      setProducts(data); // [{gtin,name,unit,price,imageUrl,orderable}]
    } catch (e) {
      setError(e.message || "상품을 불러오지 못했어요.");
    } finally {
      setLoadingProds(false);
    }
  }

  // 상품 로드후 -> 각 상품의 가용재고 조회
  useEffect(() => {
    if (!products?.length) { setAvailableByGtin({}); return; }
    let abort = false;
    (async () => {
      try {
        const pairs = await Promise.all(products.map(async (p) => {
          const inv = await fetchAvailable(p.gtin); // { gtin, available }
          return [p.gtin, inv?.available ?? 0];
        }));
        if (!abort) setAvailableByGtin(Object.fromEntries(pairs));
      } catch (e) {
        if (!abort) setToast(e.message || "재고 조회 실패");
      }
    })();
    return () => { abort = true; };
  }, [products]);

  // products가 바뀔 때 수량 초기화
  useEffect(() => {
    if (!products?.length) { setQtyByGtin({}); return; }
    const init = Object.fromEntries(products.map(p => [p.gtin, 1]));
    setQtyByGtin(init);
  }, [products]);

  // ★ 추가
function incQty(gtin) {
  setQtyByGtin(m => {
    const cur = m[gtin] ?? 1;
    const avail = availableByGtin[gtin] ?? 0;
    const next = Math.min(cur + 1, Math.max(1, avail)); // 재고 초과 방지
    return { ...m, [gtin]: next };
  });
}
function decQty(gtin) {
  setQtyByGtin(m => ({ ...m, [gtin]: Math.max(1, (m[gtin] ?? 1) - 1) }));
}
function setQty(gtin, val) {
  const num = Number(val);
  setQtyByGtin(m => {
    const avail = availableByGtin[gtin] ?? 0;
    const safe = Number.isFinite(num) ? Math.min(Math.max(1, num), Math.max(1, avail)) : (m[gtin] ?? 1);
    return { ...m, [gtin]: safe };
  });
}

  
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더: 존 탭 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="h-8 w-8 rounded-xl bg-black text-white grid place-items-center">OF</div>
            <span>OrderFlow 발주(PR)</span>
            {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-black text-white text-sm px-4 py-2 shadow transition-opacity duration-300" role="status" aria-live="polite">
          {toast}
        </div>
      )}
          </div>
          <nav className="flex gap-2">
            {ZONES.map(z => (
              <button
                key={z.key}
                className={`px-3 py-1.5 rounded-xl border ${zone===z.key?'bg-black text-white':'bg-white'}`}
                onClick={() => setZone(z.key)}
                title={z.label}
              >
                {z.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6 space-y-6">
        {/* 코너 선택기 */}
        <div className="rounded-2xl border bg-white p-4 space-y-3">
          <label className="block text-sm font-medium mb-1">코너</label>
          {loadingCorners ? (
            <div className="text-sm text-gray-500">코너 불러오는 중…</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {corners.map(c => (
                <button
                  key={c.id}
                  className={`text-left p-3 rounded-xl border hover:shadow ${cornerId===c.id?'ring-2 ring-black':''}`}
                  onClick={()=>setCornerId(c.id)} // c.id = slug
                >
                  <div className="font-medium">{c.name || '기타'}</div>
                  <div className="text-sm text-gray-500">{c.categoryCount ? `${c.categoryCount}개의 카테고리` : '카테고리 없음'}</div>
                </button>
              ))}
              {!corners.length && <div className="text-sm text-gray-500">코너 없음</div>}
            </div>
          )}
        </div>

        {/* KAN 리스트 (소분류 라벨) */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              {cornerId ? `선택 코너: ${cornerId.replaceAll('_',' ')}` : '코너를 선택하세요'}
            </h2>
            {cornerId && <div className="text-sm text-gray-500">{kans.length} KAN</div>}
          </div>

          {cornerId && (
            loadingKans ? (
              <div className="text-sm text-gray-500">카테고리 불러오는 중…</div>
            ) : (
              <ul className="divide-y rounded-xl border bg-white">
                {kans.map(k => (
                  <li
                    key={k.id}
                    role="button"
                    tabIndex={0}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => onClickKan(k.id)}
                    onKeyDown={(e) => e.key === "Enter" && onClickKan(k.id)}
                    title="상품 보기"
                  >
                    <div>
                      <div className="font-medium">{k.name || '기타'}</div>
                      <div className="text-xs text-gray-500">KAN: {k.id}</div>
                    </div>
                    <div className="text-sm text-gray-600">{k.childrenCount}개 상품</div>
                  </li>
                ))}
                {!kans.length && <li className="p-3 text-gray-500">해당 코너의 KAN이 없습니다</li>}
              </ul>
            )
          )}
        </section>


        {/* 상품 그리드 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">상품 목록</h2>
            <div className="text-sm text-gray-500">총 {products.length}개</div>
          </div>

          {loadingProds && (
            <div className="p-6 text-sm text-gray-500 border rounded-xl bg-white">불러오는 중…</div>
          )}
          {!loadingProds && error && (
            <div className="p-6 text-sm text-red-500 border rounded-xl bg-white">{error}</div>
          )}

          {!loadingProds && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => {
  const avail = availableByGtin[p.gtin] ?? 0;
  const qty   = qtyByGtin[p.gtin] ?? 1;
  const canAdd = p.orderable && avail > 0 && qty <= avail && !adding[p.gtin];
  const noStock = avail <= 0;

  return (
    <div key={p.gtin} className="border rounded-2xl bg-white p-3">
      {/* 클릭 영역: 상세 페이지로 */}
      <Link to={`/pr/detail/${p.gtin}`} className="block group">
        <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden grid place-items-center">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="object-contain w-full h-full" />
          ) : (
            <div className="text-xs text-gray-400">이미지 없음</div>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-sm text-gray-500">GTIN {p.gtin}</div>
          <div className="text-sm font-medium line-clamp-2 group-hover:underline">{p.name}</div>
          <div className="text-base font-semibold">
            {Number.isFinite(Number(p.price)) ? Number(p.price).toLocaleString() : "-"}원
            {p.unit && <span className="ml-1 text-sm text-gray-500">{p.unit}</span>}
          </div>
        </div>
      </Link>

      {/* 가용재고 + 상태 뱃지 */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-gray-500">가용재고: {avail}</div>
        {!p.orderable && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
            발주불가
          </span>
        )}
      </div>

      {/* 수량 컨트롤 */}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          aria-label="수량 감소"
          onClick={() => decQty(p.gtin)}
          className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
          disabled={qty <= 1 || !!adding[p.gtin] || noStock}
        >
          -
        </button>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(p.gtin, e.target.value)}
          className="w-16 px-2 py-1 rounded-lg border text-sm text-center"
          disabled={!!adding[p.gtin] || noStock}
        />
        <button
          type="button"
          aria-label="수량 증가"
          onClick={() => incQty(p.gtin)}
          className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
          disabled={qty >= avail || !!adding[p.gtin] || noStock}
        >
          +
        </button>
      </div>

      {/* 담기 버튼 */}
      <button
        onClick={() => createPO(p.gtin, {
          itemNo: null,
          orderQty: p.qty ?? 1,   // 사용자가 선택한 수량
          unitPrice: p.price ?? 3000, // 상품의 단가
          gtin: p.gtin
        })}
        className={`mt-3 w-full rounded-xl text-sm py-2 ${
          canAdd ? "bg-gray-900 text-white hover:opacity-90"
                 : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!canAdd}
      >
        {adding[p.gtin] ? "담는 중…" : !p.orderable ? "발주불가" : avail <= 0 ? "품절" : "장바구니"}
      </button>
    </div>
  );
})}
            </div>
          )}

        </section>
        {toast && (
  <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-black text-white text-sm px-4 py-2 shadow">
    {toast}
  </div>
)}
      </main>
    </div>
  );
  
}