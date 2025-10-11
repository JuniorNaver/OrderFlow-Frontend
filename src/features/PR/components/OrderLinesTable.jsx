
/**
 * @param {Object} props
 * @param {{productCode:string, qty:number}[]} props.lines
 * @param {(idx:number, qty:number)=>void} props.onQtyChange
 * @param {(idx:number)=>void} props.onRemove
 */
export default function OrderLinesTable({
  lines = [],
  onQtyChange = () => {},
  onRemove = () => {},
}) {
  const updateQty = (idx, raw) => {
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    const safe = Math.max(1, Math.floor(n)); // 최소 1, 정수화
    onQtyChange(idx, safe);
  };

  const totalQty = lines.reduce((sum, l) => sum + (l.qty || 0), 0);

  return (
    <div className="rounded-2xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left w-16">#</th>
            <th className="p-3 text-left">상품코드</th>
            <th className="p-3 text-right w-36">수량</th>
            <th className="p-3 text-right w-28">작업</th>
          </tr>
        </thead>

        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-6 text-center text-gray-500">
                추가된 항목이 없습니다.
              </td>
            </tr>
          ) : (
            lines.map((l, idx) => (
              <tr key={`${l.productCode}-${idx}`} className="border-t">
                <td className="p-3">{idx + 1}</td>
                <td className="p-3">
                  <div className="font-medium">{l.productCode}</div>
                </td>
                <td className="p-3 text-right">
                  <input
                    type="number"
                    min={1}
                    className="border p-1 rounded-lg w-24 text-right"
                    value={l.qty ?? 1}
                    onChange={(e) => updateQty(idx, e.target.value)}
                  />
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg border"
                    onClick={() => onRemove(idx)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>

        <tfoot className="bg-gray-50 border-t">
          <tr>
            <td className="p-3 font-medium" colSpan={2}>
              합계
            </td>
            <td className="p-3 text-right font-semibold">{totalQty}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}