import React, { useEffect, useState, useRef, useCallback } from "react";
import { Sun, Refrigerator, Snowflake, PackageOpen } from "lucide-react";
import { fetchCorners, fetchCategories, fetchProducts, fetchAvailable, reserve } from "../api/browse";
import { Link } from "react-router-dom";
import { usePOApi } from "../../PO/api/poApi";
import { toastBus } from "../../../common/utils/ToastBus";

const ZONES = [
  { key: "room", label: " 실온", icon: <Sun className="h-5 w-5" /> },
  { key: "chilled", label: "냉장", icon: <Refrigerator className="h-5 w-5" /> },
  { key: "frozen", label: "냉동", icon: <Snowflake className="h-5 w-5" /> },
  { key: "other", label: "기타", icon: <PackageOpen className="h-5 w-5" /> },
];

const slug = (s) => (s || "").trim().replace(/\s+/g, "_");
const unslug = (s) => (s || "").replace(/_/g, " ");

export default function PRBrowse() {
  // PO(장바구니 담기 기능)
  const { createPO } = usePOApi();

  const [zone, setZone] = useState("room");
  const [corners, setCorners] = useState([]);
  const [kans, setKans] = useState([]);
  const [cornerId, setCornerId] = useState(null);

  // 상품 관련 상태
  const [products, setProducts] = useState([]);
  const [availableByGtin, setAvailableByGtin] = useState({});
  const [adding, setAdding] = useState({});
  const [toast, setToast] = useState(null);
  const [loadingCorners, setLoadingCorners] = useState(false);
  const [loadingKans, setLoadingKans] = useState(false);
  const [loadingProds, setLoadingProds] = useState(false);
  const [error, setError] = useState(null);
  const [qtyByGtin, setQtyByGtin] = useState({});
  const [poId, setPoId] = useState(null); // 현재 장바구니의 헤더 ID

  const toastTimerRef = useRef(null);

  // 전역 ToastBus 구독: 어디서 emit해도 여기서 표시됨
useEffect(() => {
  const unsub = toastBus.subscribe(({ message, type }) => {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 1500);
  });
  return () => {
    unsub();
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };
}, []);

  const showToast = useCallback((message, type = "info") => {
   toastBus.emit(message, type); // 전역 버스로 발행
 }, []);

  useEffect(() => {
    return () => {
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
      .then((data) => {
        if (!abort) setCorners(data);
      })
      .catch((e) => {
        if (!abort) {
          setCorners([]);
          setError(e.message);
        }
      })
      .finally(() => {
        if (!abort) setLoadingCorners(false);
      });

    return () => {
      abort = true;
    };
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
      .then((data) => {
        if (!abort) setKans(data);
      })
      .catch((e) => {
        if (!abort) {
          setKans([]);
          setError(e.message);
        }
      })
      .finally(() => {
        if (!abort) setLoadingKans(false);
      });

    return () => {
      abort = true;
    };
  }, [zone, cornerId]);

  // KAN 클릭 → 상품 로드
  async function onClickKan(kanCode) {
    setLoadingProds(true);
    setProducts([]);
    setError(null);
    try {
      const data = await fetchProducts(kanCode, 0, 20);
      const normalized = data.map(p => ({
        gtin: p.gtin ?? p.productCode ?? p.id,
        name: p.name ?? p.productName ?? p.title ?? "",
        price: p.price ?? p.unitPrice ?? p.purchasePrice,
        unit: p.unit ?? p.unitName ?? p.packageUnit,
        imageUrl: p.imageUrl ?? p.image ?? p.thumbnailUrl ?? null,
        orderable: (p.orderable ?? true),
      }));
      setProducts(normalized);
    } catch (e) {
      setError(e.message || "상품을 불러오지 못했어요.");
    } finally {
      setLoadingProds(false);
    }
  }

  // 상품 로드 후 → 각 상품의 가용재고 조회
  useEffect(() => {
    if (!products?.length) {
      setAvailableByGtin({});
      return;
    }
    let abort = false;
    (async () => {
      try {
        const pairs = await Promise.all(
          products.map(async (p) => {
            const inv = await fetchAvailable(p.gtin);
            return [p.gtin, inv?.available ?? 0];
          })
        );
        if (!abort) setAvailableByGtin(Object.fromEntries(pairs));
      } catch (e) {
        if (!abort) toastBus.emit(e.message || "재고 조회 실패", "error");
      }
    })();
    return () => {
      abort = true;
    };
  }, [products]);

  // products 바뀔 때 수량 초기화
  useEffect(() => {
    if (!products?.length) {
      setQtyByGtin({});
      return;
    }
    const init = Object.fromEntries(products.map((p) => [p.gtin, 1]));
    setQtyByGtin(init);
  }, [products]);

  // 수량 제어 함수들
  function incQty(gtin) {
    setQtyByGtin((m) => {
      const cur = m[gtin] ?? 1;
      const avail = availableByGtin[gtin] ?? 0;
      const next = Math.min(cur + 1, Math.max(1, avail));
      return { ...m, [gtin]: next };
    });
  }

  function decQty(gtin) {
    setQtyByGtin((m) => ({ ...m, [gtin]: Math.max(1, (m[gtin] ?? 1) - 1) }));
  }

  function setQty(gtin, val) {
    const num = Number(val);
    setQtyByGtin((m) => {
      const avail = availableByGtin[gtin] ?? 0;
      const safe = Number.isFinite(num)
        ? Math.min(Math.max(1, num), Math.max(1, avail))
        : m[gtin] ?? 1;
      return { ...m, [gtin]: safe };
    });
  }

  async function addToCart(p) {
  const gtin = p.gtin;
  const qty = qtyByGtin[gtin] ?? 1;
  if (qty <= 0) return;

  // 로딩 플래그 ON
  setAdding(s => ({ ...s, [gtin]: true }));
  const prevAvail = availableByGtin[gtin] ?? 0;

  try {
    // 1) 서버에 예약(available = onHand - reserved 라면 필수)
    await reserve(gtin, qty); // 필요 시 storeId 등 인자 추가

    // 2) PO 라인 생성 (기존 poId 있으면 재사용)
    const res = await createPO({ poId, gtin, orderQty: qty });
    if (!poId && res?.poId) setPoId(res.poId);

    // 3) 낙관적 차감
    setAvailableByGtin(m => ({ ...m, [gtin]: Math.max(0, (m[gtin] ?? 0) - qty) }));
    // 수량도 가용치 범위로 보정
    setQtyByGtin(m => ({
      ...m,
      [gtin]: Math.min(m[gtin] ?? 1, Math.max(1, prevAvail - qty)),
    }));

    showToast(`${p.name} ${qty}개 담았습니다 ✅`, "success");
  } catch (e) {
    console.error("장바구니 담기 실패:", e);
    showToast(e?.message ?? "장바구니 추가 중 오류가 발생했습니다 ❌", "error");
  } finally {
    // 로딩 플래그 OFF
    setAdding(s => ({ ...s, [gtin]: false }));
    // 4) 서버 진실값으로 단건 재동기화(가볍고 정확)
    try {
      const inv = await fetchAvailable(gtin);
      setAvailableByGtin(m => ({ ...m, [gtin]: inv?.available ?? 0 }));
    } catch {/* no-op */}
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더: 존 탭 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="h-8 w-8 rounded-xl bg-black text-white grid place-items-center">OF</div>
            <span>OrderFlow 발주(PR)</span>
          </div>

          <nav className="flex gap-2">
            {ZONES.map((z) => (
              <button
                key={z.key}
                className={`px-3 py-1.5 rounded-xl border ${zone === z.key ? "bg-black text-white" : "bg-white"
                  }`}
                onClick={() => setZone(z.key)}
                title={z.label}
              >
                {z.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        {/* 코너 선택기 */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 auto-rows-min">
          <aside className="rounded-2xl border bg-white p-4 space-y-3 lg:col-start-1 lg:row-start-1">
          <label className="block text-sm font-medium mb-1">코너</label>
          {loadingCorners ? (
            <div className="text-sm text-gray-500">코너 불러오는 중…</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {corners.map((c) => (
                <button
                  key={c.id}
                  className={`text-left p-3 rounded-xl border hover:shadow ${cornerId === c.id ? "ring-2 ring-black" : ""
                    }`}
                  onClick={() => setCornerId(c.id)}
                >
                  <div className="font-medium">{c.name || "기타"}</div>
                  <div className="text-sm text-gray-500">
                    {c.categoryCount
                      ? `${c.categoryCount}개의 카테고리`
                      : "카테고리 없음"}
                  </div>
                </button>
              ))}
              {!corners.length && (
                <div className="text-sm text-gray-500">코너 없음</div>
              )}
            </div>
          )}
          </aside>
        
        

        {/* KAN 리스트 */}
        <section className="rounded-2xl border bg-white overflow-hidden lg:col-start-2 lg:row-start-1">
          <div className="p-3 flex items-center justify-between border-b">
            <h2 className="text-sm font-semibold text-gray-900">
              {cornerId
                ? `선택 코너: ${cornerId.replaceAll("_", " ")}`
                : "코너를 선택하세요"}
            </h2>
            {cornerId && (
              <div className="text-sm text-gray-500">{kans.length} KAN</div>
            )}
          </div>

          {cornerId && (
            loadingKans ? (
              <div className="text-sm text-gray-500">카테고리 불러오는 중…</div>
            ) : (
              <ul className="max-h-[calc(100vh-280px)] overflow-auto divide-y">
                {kans.map((k) => (
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
                      <div className="font-medium">{k.name || "기타"}</div>
                      <div className="text-xs text-gray-500">KAN: {k.id}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {k.childrenCount}개 상품
                    </div>
                  </li>
                ))}
                {!kans.length && (
                  <li className="p-3 text-gray-500">해당 코너의 KAN이 없습니다</li>
                )}
              </ul>
            )
          )}
        </section>

        {/* 상품 그리드 */}
        <section className="lg:col-span-2 self-start">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">상품 목록</h2>
            <div className="text-sm text-gray-500">총 {products.length}개</div>
          </div>

          {loadingProds && (
            <div className="p-6 text-sm text-gray-500 border rounded-xl bg-white">
              불러오는 중…
            </div>
          )}
          {!loadingProds && error && (
            <div className="p-6 text-sm text-red-500 border rounded-xl bg-white">
              {error}
            </div>
          )}
          {!loadingProds && !error && products.length === 0 && (
        <div className="p-6 text-sm text-gray-500 border rounded-xl bg-white">
          상품이 없습니다. 왼쪽에서 KAN을 선택해 주세요.
        </div>
          )}

          {!loadingProds && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => {
                const avail = availableByGtin[p.gtin] ?? 0;
                const qty = qtyByGtin[p.gtin] ?? 1;
                const canAdd =
                  p.orderable && avail > 0 && qty <= avail && !adding[p.gtin];
                const noStock = avail <= 0;

                return (
                  <div key={p.gtin} className="border rounded-2xl bg-white p-3">
                    <Link to={`/pr/detail/${p.gtin}`} className="block group">
                      <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden grid place-items-center">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <div className="text-xs text-gray-400">이미지 없음</div>
                        )}
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="text-sm text-gray-500">GTIN {p.gtin}</div>
                        <div className="text-sm font-medium line-clamp-2 group-hover:underline">
                          {p.name}
                        </div>
                        <div className="text-base font-semibold">
                          {Number.isFinite(Number(p.price))
                            ? Number(p.price).toLocaleString()
                            : "-"}
                          원
                          {p.unit && (
                            <span className="ml-1 text-sm text-gray-500">
                              {p.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

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
                      onClick={() => addToCart(p)}
                      className={`mt-3 w-full rounded-xl text-sm py-2 ${canAdd
                          ? "bg-gray-900 text-white hover:opacity-90"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      disabled={!canAdd}
                    >
                      {adding[p.gtin]
                        ? "담는 중…"
                        : !p.orderable
                          ? "발주불가"
                          : avail <= 0
                            ? "품절"
                            : "장바구니"}
                    </button>

                  </div>
                );
              })}
            </div>
          )}
        </section>
        </div>
      </main>
    </div >
  );
}