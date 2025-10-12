import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
// 필요한 경우: import { searchProducts } from "../api/api";  // ← 네 API에 맞춰 바꿔줘

// (선택) 로컬 목업 폴백
const MOCK_PRODUCTS = [
  { productCode: "88010001", name: "코카콜라 500ml" },
  { productCode: "88010002", name: "진라면 매운맛" },
  { productCode: "88010003", name: "삼다수 2L" },
];

function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/**
 * props:
 *  - onAdd({ productCode, qty })
 */
export default function OrderForm({ onAdd }) {
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState(null); // {productCode, name}
  const debounced = useDebounced(query, 250);
  const listRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(-1); // 키보드 ↑↓용

  // 실제 API가 있으면 이 부분을 교체
  const { data: result, isLoading } = useQuery({
    queryKey: ["product-search", debounced],
    queryFn: async () => {
      if (!debounced) return [];
      try {
        // 서버가 있다면:
        // const res = await searchProducts({ q: debounced, limit: 10 });
        // return res.items; // [{productCode, name}, ...]
        const lower = debounced.toLowerCase();
        return MOCK_PRODUCTS.filter(
          p => p.name.toLowerCase().includes(lower) || p.productCode.includes(debounced)
        ).slice(0, 10);
      } catch {
        return [];
      }
    },
    enabled: debounced.length > 0,
    staleTime: 10_000,
  });

  const options = useMemo(() => result ?? [], [result]);

  const canAdd = useMemo(() => {
    const pc = selected?.productCode || query.trim();
    return pc && Number(qty) > 0;
  }, [selected, query, qty]);

  const handleAdd = () => {
    const productCode = selected?.productCode || query.trim();
    const nqty = Math.max(0, Number(qty) || 0);
    if (!productCode || nqty <= 0) return;
    onAdd({ productCode, qty: nqty });
    // 입력 초기화
    setSelected(null);
    setQuery("");
    setQty(1);
    setActiveIdx(-1);
  };

  const onSelect = (opt) => {
    setSelected(opt);
    setQuery(`${opt.name} (${opt.productCode})`);
    setActiveIdx(-1);
  };

  const onKeyDown = (e) => {
    if (!options.length) {
      if (e.key === "Enter" && canAdd) handleAdd();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0) {
        onSelect(options[activeIdx]);
      } else if (canAdd) {
        handleAdd();
      }
    } else if (e.key === "Escape") {
      setActiveIdx(-1);
    }
  };

  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-idx="${activeIdx}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end">
      {/* 상품 검색/코드 입력 */}
      <div className="relative md:flex-1">
        <label className="block text-sm text-gray-600 mb-1">상품 검색/코드</label>
        <input
          className="w-full rounded-xl border px-3 py-2"
          placeholder="상품명 또는 상품코드 입력"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setActiveIdx(-1);
          }}
          onKeyDown={onKeyDown}
        />
        {/* 자동완성 드롭다운 */}
        {query && options.length > 0 && (
          <div
            ref={listRef}
            className="absolute z-30 mt-1 w-full max-h-56 overflow-auto rounded-xl border bg-white shadow"
          >
            {options.map((opt, i) => (
              <button
                key={opt.productCode}
                data-idx={i}
                type="button"
                onClick={() => onSelect(opt)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                  i === activeIdx ? "bg-gray-100" : ""
                }`}
              >
                <div className="font-medium">{opt.name}</div>
                <div className="text-xs text-gray-500">{opt.productCode}</div>
              </button>
            ))}
          </div>
        )}
        {isLoading && query && (
          <div className="absolute right-3 top-9 text-xs text-gray-400">검색중…</div>
        )}
      </div>

      {/* 수량 */}
      <div className="md:w-40">
        <label className="block text-sm text-gray-600 mb-1">수량</label>
        <input
          className="w-full rounded-xl border px-3 py-2"
          type="number"
          min={1}
          inputMode="numeric"
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        />
      </div>

      {/* 추가 버튼 */}
      <div className="md:w-40">
        <label className="block text-sm text-transparent mb-1">.</label>
        <button
          type="button"
          disabled={!canAdd}
          onClick={handleAdd}
          className={`w-full rounded-xl px-4 py-2 ${
            canAdd ? "bg-black text-white hover:opacity-90" : "bg-gray-200 text-gray-500"
          }`}
        >
          추가
        </button>
      </div>
    </div>
  );
}
