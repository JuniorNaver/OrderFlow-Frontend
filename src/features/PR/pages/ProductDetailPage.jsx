import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getProduct, getRelated } from "../api/product";
import { fetchAvailable, reserve } from "../api/browse";
import { usePOApi } from "../../PO/api/poApi";

export default function ProductDetailPage() {
  const { gtin = "" } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { createPO }= usePOApi();
  const [tab, setTab] = useState("info"); // info | stock | history
  const [qty, setQty] = useState(1);
  const [poId, setPoId] = useState(() => {
    try { return localStorage.getItem("poId"); } catch { return null; }
  });

  // 숫자 보정 유틸 (1 이상, 재고 한도 내)
const clampQty = (v) => {
  const n = Number.isFinite(Number(v)) ? Math.floor(Number(v)) : 1;
  const max = qInv.data?.available ?? Infinity; // 가용 없으면 상한 없음
  return Math.max(1, Math.min(n, max));
};
  const q = useQuery({
    queryKey: ["product", gtin],
    queryFn: () => getProduct(gtin),
    enabled: !!gtin,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
  const product = q.data;

  // 2) 연관 상품 (카테고리 기준)
  const qRel = useQuery({
    queryKey: ["related", product?.categoryCode, gtin], // ✅ gtin 포함
    queryFn: () => getRelated(product.categoryCode, { size: 8 }),
    enabled: !!product?.categoryCode,
    select: (arr) => (arr || []).filter((p) => p.gtin !== gtin),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 0,
  });

  // 3) 재고(가용) — 탭에서 쓰려고 별도 쿼리
 const qInv = useQuery({
  queryKey: ["available", gtin],
  queryFn: () => fetchAvailable(gtin),
  enabled: !!gtin,        // ← tab 조건 삭제
  staleTime: 10_000,
  gcTime: 60_000,
  retry: 0,
});

const mReserve = useMutation({
    mutationFn: ({ qty }) => reserve(gtin, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["available", gtin] }),
  });

const unitPrice = Number(product?.price ?? 0);
const totalText = useMemo(() => {
  const total = unitPrice * qty;
  return Number.isFinite(total) ? `${total.toLocaleString()}원` : "-";
}, [unitPrice, qty]);


  const priceText = useMemo(() => {
    if (!product?.price && product?.price !== 0) return "-";
  const n = Number(product.price);
  return Number.isFinite(n) ? `${n.toLocaleString()}원` : "-";
  }, [product]);

  if (!gtin) return <ErrorBox text="잘못된 접근입니다." onBack={() => nav(-1)} />;
  if (q.isLoading) return <Skeleton />;
  if (q.isError || !product) return <ErrorBox text="상품을 불러오지 못했어요." onBack={() => nav(-1)} />;

  const dims =
    [product.widthMm, product.depthMm, product.heightMm].every((v) => v != null)
      ? `${product.widthMm} × ${product.depthMm} × ${product.heightMm} mm`
      : "-";

  async function addToCart() {
    if (!product?.gtin) return;
    const orderQty = clampQty(qty); // 가용 한도 내 보정
    
    try {
      // 1) 재고 예약 (가용 = onHand - reserved 정책이라면 필수)
      await reserve(product.gtin, orderQty);

      // 2) PO 라인 생성(기존 헤더 있으면 재사용)
      const res = await createPO({ poId, gtin: product.gtin, orderQty: qty });
      const newId = res?.poId ?? res?.id ?? res?.data?.poId ?? res?.data?.id;
      if (!poId && newId) {
        setPoId(newId);
        try { localStorage.setItem("poId", String(newId)); } catch {}
      }

      // 3) 재고쿼리만 즉시 새로고침
      qc.invalidateQueries({ queryKey: ["available", product.gtin] });

      // 4) PO로 이동
      nav("/po");
    } catch (e) {
      console.error("장바구니 담기에 실패했어요", e);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* breadcrumbs */}
      <nav className="text-sm text-gray-500">
        <Link to="/" className="hover:underline">홈</Link>
        <span className="mx-1">/</span>
        <Link to={`/pr?category=${product.categoryCode}`} className="hover:underline">
          {product.categoryName ?? product.categoryCode}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700">{product.productName}</span>
      </nav>

      {/* 헤더 */}
      <header className="flex items-start justify-between gap-4">
  <div>
    <h1 className="text-2xl font-semibold">{product.productName}</h1>
    <p className="text-gray-500 mt-1">GTIN: {product.gtin}</p>
    {product.orderable === false && (
      <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-gray-200">발주중지</span>
    )}
    {qInv.data?.available != null && (
      <p className="text-xs text-gray-500 mt-1">가용 {qInv.data.available}개</p>
    )}
  </div>

  <div className="flex items-center gap-3">
    {/* 수량 선택 */}
    <div className="flex items-center gap-2">
      <button
        onClick={() => setQty((q) => clampQty(q - 1))}
        className="w-9 h-9 rounded-lg border hover:bg-gray-50"
        aria-label="decrement"
      >−</button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={qInv.data?.available ?? undefined}
        value={qty}
        onChange={(e) => setQty(clampQty(e.target.value))}
        className="w-16 h-9 text-center border rounded-lg"
      />
      <button
        onClick={() => setQty((q) => clampQty(q + 1))}
        className="w-9 h-9 rounded-lg border hover:bg-gray-50"
        aria-label="increment"
      >+</button>
    </div>

    {/* 합계 */}
    <div className="text-right">
      <div className="text-xs text-gray-500">합계</div>
      <div className="font-semibold">{totalText}</div>
    </div>

    {/* 담기 */}
    <button
      onClick={addToCart}
      disabled={product.orderable === false || qty < 1 || (qInv.data?.available ?? 1) < 1}
      className="px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      장바구니
    </button>
  </div>
</header>

      {/* 본문 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 이미지 */}
        <div className="md:col-span-1">
          <div className="aspect-square border rounded-2xl overflow-hidden flex items-center justify-center bg-white">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.productName} className="object-contain h-full w-full" />
            ) : (
              <div className="text-gray-400">이미지 없음</div>
            )}
          </div>
        </div>

        {/* 스펙 + 탭 */}
        <div className="md:col-span-2 space-y-4">
          {/* 스펙 카드 */}
          <div className="rounded-2xl border p-4">
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-y-3">
              <Desc term="단위" val={product.unit ?? "-"} />
              <Desc term="보관" val={product.storageMethod ?? "-"} />
              <Desc term="가격" val={priceText} />
              <Desc term="유통기한" val={product.shelfLifeDays ? `${product.shelfLifeDays}일` : "-"} />
              <Desc term="치수" val={dims} />
              <Desc term="분류" val={product.categoryName ?? product.categoryCode ?? "-"} />
            </dl>
          </div>

          {/* 탭 */}
          <div className="rounded-2xl border">
            <div className="flex gap-1 p-1 border-b">
              {["info", "stock", "history"].map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-4 py-2 rounded-xl text-sm ${
                    tab === k ? "bg-gray-900 text-white" : "hover:bg-gray-50"
                  }`}
                >
                  {k === "info" ? "상세정보" : k === "stock" ? "재고" : "입출고 이력"}
                </button>
              ))}
            </div>
            <div className="p-4">
              {tab === "info" && <Info description={product.description} />}
              {tab === "stock" && (
                <StockPanel
                  loading={qInv.isLoading}
                  data={qInv.data}
                  onReserve={(qty) => mReserve.mutate({ qty })}
                  reserving={mReserve.isPending}
                />
              )}
              {tab === "history" && <HistoryPanel gtin={product.gtin} />}
            </div>
          </div>
        </div>
      </section>

      {/* 연관 상품 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">연관 상품</h2>
        {qRel.isLoading && <div className="text-gray-400">불러오는 중…</div>}
        {!qRel.isLoading && (qRel.data?.length ?? 0) === 0 && (
          <div className="text-gray-400 text-sm">연관 상품이 없습니다.</div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(qRel.data ?? []).map((p) => (
            <Link key={p.gtin} to={`/pr/detail/${p.gtin}`} className="border rounded-2xl p-3 hover:shadow-sm">
              <div className="aspect-square bg-gray-50 rounded-xl mb-2 flex items-center justify-center">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" className="object-contain h-full w-full" />
                ) : (
                  <span className="text-gray-400 text-sm">이미지</span>
                )}
              </div>
              <div className="text-sm font-medium line-clamp-2">{p.productName}</div>
              <div className="text-xs text-gray-500 mt-1">GTIN {p.gtin}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- sub components ---------- */
function Desc({ term, val }) {
  return (
    <div>
      <dt className="text-gray-500 text-sm">{term}</dt>
      <dd className="font-medium">{val}</dd>
    </div>
  );
}

function Info({ description }) {
  return (
    <article className="prose max-w-none whitespace-pre-line">
      {description || "상세설명이 없습니다."}
    </article>
  );
}

function StockPanel({ loading, data, onReserve, reserving }) {
  if (loading) return <div className="text-gray-400">재고 불러오는 중…</div>;
  if (!data) return <div className="text-gray-400">재고 정보 없음</div>;

  const { available, onHand, reserved } = data;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="가용" value={available} />
        <Stat label="재고" value={onHand} />
        <Stat label="예약" value={reserved} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onReserve(1)}
          disabled={reserving || available <= 0}
          className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
        >
          1개 예약
        </button>
        {/* 필요하면 수량 입력/증감 버튼 추가 */}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value ?? "-"}</div>
    </div>
  );
}

function HistoryPanel() {
  return <div className="text-sm text-gray-500">입출고 이력 연동 예정</div>;
}

function Skeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-6 w-56 bg-gray-200 animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="aspect-square bg-gray-200 animate-pulse rounded" />
        <div className="md:col-span-2 space-y-3">
          <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
          <div className="h-5 w-1/2 bg-gray-200 animate-pulse rounded" />
          <div className="h-32 w-full bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ text, onBack }) {
  return (
    <div className="p-6">
      <p className="text-red-600">{text}</p>
      <button onClick={onBack} className="mt-3 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">
        뒤로가기
      </button>
    </div>
  );
}