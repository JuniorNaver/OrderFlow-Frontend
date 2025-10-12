
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
  const fmtInt = (n) => Number(n || 0).toLocaleString();
  const fmtWon = (n) => `${fmtInt(n)}원`;

  const totalQty = lines.reduce((s, l) => s + (Number(l.qty) || 0), 0);
  const totalAmt = lines.reduce(
    (s, l) => s + (Number(l.unitPrice || 0) * (Number(l.qty) || 0)),
    0
  );

  const updateQty = (idx, raw) => {
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    const safe = Math.max(1, Math.floor(n)); // 최소 1, 정수화
    onQtyChange(idx, safe);
  };

  const dec = (idx, cur) => onQtyChange(idx, Math.max(1, Number(cur || 1) - 1));
  const inc = (idx, cur) => onQtyChange(idx, Math.max(1, Number(cur || 1) + 1));

  return (
    <div className="rounded-2xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">상품코드</th>
            <th className="p-2 text-left">수량</th>
            <th className="p-2 text-right">단가</th>
            <th className="p-2 text-right">합계</th>
            <th className="p-2"></th>
          </tr>
        </thead>

        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-6 text-center text-gray-500">
                추가된 항목이 없습니다.
              </td>
            </tr>
          ) : (
            lines.map((l, idx) => {
              const qty = Math.max(1, Number(l.qty) || 1);
              const unit = Number(l.unitPrice || 0);
              const sum = unit * qty;

              return (
                <tr key={`${l.productCode}-${idx}`} className="border-t">
                  {/* 상품코드(+이름 보조) */}
                  <td className="p-3">
                    <div className="font-medium">{l.productCode}</div>
                    {l.name && <div className="text-xs text-gray-500">{l.name}</div>}
                  </td>

                  {/* 수량 +/– 컨트롤 */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-2 py-1 rounded border"
                        onClick={() => dec(idx, qty)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        className="border p-1 rounded-lg w-20 text-right"
                        value={qty}
                        onChange={(e) => updateQty(idx, e.target.value)}
                        onBlur={(e) => updateQty(idx, e.target.value)}
                        inputMode="numeric"
                      />
                      <button
                        type="button"
                        className="px-2 py-1 rounded border"
                        onClick={() => inc(idx, qty)}
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* 단가 */}
                  <td className="p-3 text-right">{fmtWon(unit)}</td>

                  {/* 합계 */}
                  <td className="p-3 text-right font-medium">{fmtWon(sum)}</td>

                  {/* 삭제 */}
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                      onClick={() => onRemove(idx)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>

        <tfoot className="bg-gray-50 border-t">
          <tr>
            <td className="p-3 font-medium">합계</td>
            <td className="p-3 font-medium">{fmtInt(totalQty)}</td>
            <td className="p-3"></td>
            <td className="p-3 text-right font-bold">{fmtWon(totalAmt)}</td>
            <td className="p-3"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}