import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listPurchaseRequests, createPurchaseRequest} from "../api/api"; 
import OrderFilters from "../components/OrderFilters";
import OrderForm from "../components/OrderForm";
import OrderLinesTable from "../components/OrderLinesTable";
import OrderToolbar from "../components/OrderToolbar";
import { useParams } from "react-router-dom";

export default function OrdersPage() {
  const { storeId = "S001" } = useParams();
  const qc = useQueryClient();

  const [filters, setFilters] = useState({});
  const [lines, setLines] = useState([]);

  const queryKey = ["pr-orders", storeId, JSON.stringify(filters)];
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => listPurchaseRequests(storeId, { ...filters, page:0, size:20 }),
    enabled: !!storeId,
    keepPreviousData: true,       // ✅ 페이지/필터 전환 시 스켈레톤 깜빡임 완화
  staleTime: 10_000,            // 10초 캐시 신선
  });

  const createMut = useMutation({
    mutationFn: () => {
      const validLines = lines.filter(l => Number(l.qty) > 0);
      return createPurchaseRequest(storeId, { lines: validLines });
    },
    onSuccess: () => { 
      setLines([]);
      // 최신 목록 갱신
      qc.invalidateQueries({ queryKey });
    },
    onError: (e) => { console.error(e); alert("발주 생성 실패 잠시 후 시도해 주세요."); }
  });

  const exportCsv = () => {
    const validLines = (Array.isArray(lines) ? lines : []).filter(l => Number(l.qty) > 0);
    const rows = [["productCode","qty"], ...validLines.map(l => [l.productCode, l.qty])];
    const csv = rows.map(r => r.join(",")).join("\r\n"); // 엑셀 호환 약간 더 좋음
    const blob = new Blob(["\uFEFF" +csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "purchase_request.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // 중복 상품 추가 시 수량 합치고 싶으면 이 onAdd 사용
  const onAddLine = (line) => {
    setLines(prev => {
      const idx = prev.findIndex(x => x.productCode === line.productCode);
      if (idx === -1) return [...prev, line];
      const next = [...prev];
      next[idx] = { ...next[idx], qty: (next[idx].qty || 0) + (line.qty || 0) };
      return next;
    });
  };

  

  return (
    <div className="space-y-4">
      <OrderFilters value={filters} onChange={setFilters} />
      <OrderForm onAdd={onAddLine} />
      <OrderLinesTable
        lines={lines}
        onQtyChange={(i,qty)=>setLines(xs=>xs.map((x,idx)=>idx === i ? ({ ...x, qty: Math.max(0, Number(qty) || 0) }) : x))}
        onRemove={(i)=>setLines(xs=>xs.filter((_,idx)=>idx!==i))}
      />
      <OrderToolbar
        disabled={lines.every(l => Number(l.qty) <= 0) || createMut.isPending}
        submitting={createMut.isPending}
        onSubmit={()=>createMut.mutate()}
        onExport={exportCsv}
        onReset={()=>setLines([])}
      />

      {/* 기존 발주 목록(최근 20건) */}
      <section>
        <h3 className="font-semibold">최근 발주</h3>
        {isLoading && "불러오는 중..."}
        {isError && "목록을 불러오지 못했습니다."}
        {!isLoading && !isError && (data?.content ?? []).map(o => (
          <div key={o.id}>{o.id} · {o.status} · {new Date(o.createdAt).toLocaleString()}</div>
        ))}
      </section>
    </div>
  );
}
