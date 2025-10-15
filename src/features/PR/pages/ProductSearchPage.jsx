// src/features/PR/pages/SearchProducts.jsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../api/shop";
import ProductCard from "../components/ProductCard";
import { placeholder } from "../mock/Categories.mock";

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ProductSearchPage() {
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const dq = useDebounced(q, 300);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", { q: dq, categoryId, page: 0, size: 24 }],
    queryFn: () => listProducts({ q: dq || undefined, categoryId: categoryId || undefined, page: 0, size: 24 }),
    enabled: dq.length > 0 || categoryId.length > 0, // 최소 하나는 있어야 조회
    staleTime: 30_000,
  });

  const products = Array.isArray(data?.content) ? data.content : [];

  return (
    <div className="space-y-4">
      {/* 검색바 */}
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="상품명/코드 검색"
          className="border rounded-xl p-2 flex-1"
        />
        {/* 카테고리 셀렉트는 나중에 옵션 붙이면 됨 */}
        {/* <select value={categoryId} onChange={(e)=>setCategoryId(e.target.value)} className="border rounded-xl p-2">
          <option value="">전체</option>
          <option value="C001">음료</option>
        </select> */}
      </div>

      {/* 상태 표시 */}
      {isLoading && <div>검색 중…</div>}
      {isError && <div>검색 실패. 네트워크/서버를 확인해주세요.</div>}
      {!isLoading && products.length === 0 && (dq || categoryId) && <div>검색 결과가 없습니다.</div>}

      {/* 결과 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {products.map((p) => (
          <ProductCard
            key={p.productCode}
            product={{
              productCode: p.productCode,
              name: p.name,
              unitPrice: p.unitPrice,
              imageUrl: p.imageUrl || placeholder(p.productCode, 300),
            }}
          />
        ))}
      </div>
    </div>
  );
}
