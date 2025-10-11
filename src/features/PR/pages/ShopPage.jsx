import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { listCategories, listProducts } from "../api/shop";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";

export default function ShopPage() {
  const { storeId = "S001" } = useParams();
  const [categoryId, setCategoryId] = useState("");
  const [q, setQ] = useState("");

  const catQ = useQuery({ queryKey: ["cats"], queryFn: listCategories });
  const prodQ = useQuery({
    queryKey: ["products", categoryId, q],
    queryFn: () => listProducts({ categoryId: categoryId || undefined, q: q || undefined, page: 0, size: 24 }),
  });

  useEffect(()=>{ /* 스크롤 상단 복귀 등 필요시 */ }, [categoryId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          placeholder="상품 검색"
          className="border rounded-xl p-2 flex-1"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />
        <Link to={`/pr/stores/${storeId}/cart`} className="px-3 py-2 rounded-xl border relative">
          장바구니
        </Link>
      </div>

      <CategoryFilter categories={catQ.data ?? []} value={categoryId} onChange={setCategoryId} />

      {prodQ.isLoading ? (
        <div>불러오는 중…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(prodQ.data?.content ?? []).map(p => (
            <ProductCard key={p.productCode} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
