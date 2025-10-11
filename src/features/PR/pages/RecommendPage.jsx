import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getRecommend, createPurchaseRequest } from "../api/api";
import ProductCard from "../components/ProductCard";
import { MOCK_PRODUCTS } from "../mock/data";

export default function RecommendPage() {
  const { storeId = "" } = useParams();
  const nav = useNavigate();
  

  const q = useQuery({
    queryKey: ["pr-recommend", storeId],
    queryFn: () => getRecommend(storeId),
    enabled: !!storeId,
    retry: 0, // 임시: 실패 시 바로 폴백
  });

  const lines =
    q.data?.items?.map(it => ({ productCode: it.productCode, qty: it.suggestedQty })) ??
    MOCK_PRODUCTS.map(p => ({ productCode: p.productCode, qty: 1 }));


  const goToPO = () => {
    nav("/po", {
      state: { from: "pr-recommend", storeId, items: lines },
    });
  };

  const createMut = useMutation({
    mutationFn: (lines) => createPurchaseRequest(storeId, { storeId, lines }),
  });


  return (
     <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">추천 발주</h1>
        <span className="text-gray-500 text-sm">
          {q.isLoading ? "불러오는 중…" : q.error ? "임시 데이터 표시중" : "추천 데이터"}
        </span>
      </div>

      {/* 카드 그리드: API 성공이면 상품명/가격은 나중에 별도 조회 필요.
          지금은 임시 데이터로 채운 카드 보여주기 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MOCK_PRODUCTS.map(p => (
          <ProductCard
            key={p.productCode}
            product={p}
            onClick={(prod) => nav("/po", {
              state: { from: "pr-recommend", storeId,
                items: [{ productCode: prod.productCode, qty: 1 }] }
            })}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded-xl border"
          onClick={goToPO}
          disabled={lines.length === 0}
        >
          전체 담아서 PO로 이동
        </button>

        <button
          className="px-4 py-2 rounded-xl border"
          onClick={() => createMut.mutate(lines)}
          disabled={createMut.isPending || lines.length === 0}
        >
          추천 그대로 발주 생성
        </button>
      </div>
    </div>
  );
}