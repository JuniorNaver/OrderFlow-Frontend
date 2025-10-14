import { useMemo } from "react";


const KRW = new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 });


const formatWon = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return KRW.format(0);
  // 괄호표기 원하면: if (num < 0) return `(${KRW.format(Math.abs(num))})`;
  return KRW.format(num);
};

function OrderPage() {
   const nowText = useMemo(() => new Date().toLocaleString(), []);
   const handleOpenCart = () => {
     console.log("open cart", items);
     alert("장바구니 보기 (연동 포인트)");
   };


return (
<div className="min-h-screen bg-gray-50">
{/* 상단 공통 헤더 */}
<header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
<div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
<button type="button" className="p-2 rounded-xl border">☰</button>
<div className="flex-1 flex items-center gap-3">
<div className="text-xl font-bold tracking-tight">발주</div>
<div className="text-xs text-gray-500">{nowText}</div>
</div>
<div className="w-9 h-9 rounded-full bg-amber-200" />
</div>
</header>


{/* 콘텐츠 래퍼 */}
<main className="mx-auto max-w-7xl px-4 py-4">
{/* 카테고리 + 검색 */}
<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
<CategoryTabs value={category} onChange={setCategory} />
<div className="relative w-full md:w-80">
<input
className="w-full rounded-xl border px-3 py-2 pr-10"
placeholder="Search"
value={search}
onChange={(e) => setSearch(e.target.value)}
autoComplete="off"
spellCheck={false}
/>
<span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
</div>
</div>


{/* 상단 지표 (도넛) */}
<div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-3">
<Donut label="재고예산 상태" value={62} />
<Donut label="창고 사용율" value={48} />
<Donut label="예산 소진율" value={75} />
</div>


{/* 상품 그리드 */}
<section className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
{products.map((p) => (
<ProductCard
key={p.productCode}
product={p}
qty={cart[p.productCode] ?? 0}
onAdd={() => add(p.productCode)}
onSub={() => sub(p.productCode)}
/>
))}
</section>


{/* 빈 상태 */}
{products.length === 0 && (
<div className="mt-16 text-center text-gray-500">조건에 맞는 상품이 없어요.</div>
)}


{/* 바닥 알림/요약 바 */}
<div className="h-28" />
</main>


<div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
<div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
<div className="text-sm text-gray-700" aria-live="polite">
<span className="font-semibold text-fuchsia-700">장바구니</span> 환영합니다! 담긴 상품: {items.length} · 총 수량: {totalQty} · 합계 {formatWon(totalPrice)}
</div>
<div className="flex gap-2">
<button type="button" onClick={handleOpenCart} className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50">
장바구니 보기
</button>
<button type="button" onClick={handleCheckout} className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90">
즉시 발주
</button>
</div>
</div>
</div>
</div>
)
};