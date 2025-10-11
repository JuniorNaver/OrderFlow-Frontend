import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { listPurchaseRequests, createPurchaseRequest} from "../api/api"; 
import OrderFilters from "../components/OrderFilters";
import OrderForm from "../components/OrderForm";
import OrderLinesTable from "../components/OrderLinesTable";
import OrderToolbar from "../components/OrderToolbar";
import { useParams } from "react-router-dom";

export default function OrdersPage() {
  const { storeId = "S001" } = useParams();
  const [filters, setFilters] = useState({});
  const [lines, setLines] = useState([]);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["pr-orders", storeId, filters],
    queryFn: () => listPurchaseRequests(storeId, { ...filters, page:0, size:20 }),
    enabled: !!storeId
  });

  const createMut = useMutation({
    mutationFn: () => createPurchaseRequest(storeId, { storeId, lines }),
    onSuccess: () => { setLines([]); refetch(); }
  });

  const exportCsv = () => {
    // 간단 CSV: headers + rows
    const rows = [["productCode", "qty"], ...lines.map(l => [l.productCode, l.qty])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "purchase_request.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  

  return (
    <div className="space-y-4">
      <OrderFilters value={filters} onChange={setFilters} />
      <OrderForm onAdd={(line)=>setLines(xs=>[...xs, line])} />
      <OrderLinesTable
        lines={lines}
        onQtyChange={(i,qty)=>setLines(xs=>xs.map((x,idx)=>idx===i?({...x, qty}):x))}
        onRemove={(i)=>setLines(xs=>xs.filter((_,idx)=>idx!==i))}
      />
      <OrderToolbar
        disabled={lines.length===0 || createMut.isPending}
        submitting={createMut.isPending}
        onSubmit={()=>createMut.mutate()}
        onExport={()=>{exportCsv}}
        onReset={()=>setLines([])}
      />

      {/* 기존 발주 목록(최근 20건) */}
      <section>
        <h3 className="font-semibold">최근 발주</h3>
        {isLoading ? "불러오는 중..." : (data?.content ?? []).map(o=>(
          <div key={o.id}>{o.id} · {o.status} · {new Date(o.createdAt).toLocaleString()}</div>
        ))}
      </section>
    </div>
  );
}
