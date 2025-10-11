
/**
 * @param {{
 *  value: { from?:string, to?:string, vendorId?:string, status?:string },
 *  onChange: (next:any)=>void,
 *  vendorOptions?: {label:string, value:string}[]
 * }} props
 */
export default function OrderFilters({
  value = {},
  onChange = () => {},
  vendorOptions = []
}) {
  const set = (patch) => onChange({ ...value, ...patch });
  const reset = () => onChange({}); // 전부 초기화

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* 기간 */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">시작일</label>
        <input
          type="date"
          className="border p-2 rounded-lg"
          value={value.from || ""}
          onChange={(e) => set({ from: e.target.value })}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">종료일</label>
        <input
          type="date"
          className="border p-2 rounded-lg"
          value={value.to || ""}
          onChange={(e) => set({ to: e.target.value })}
        />
      </div>

      {/* 공급업체 */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">공급업체</label>
        <select
          className="border p-2 rounded-lg min-w-[160px]"
          value={value.vendorId || ""}
          onChange={(e) => set({ vendorId: e.target.value || undefined })}
        >
          <option value="">전체</option>
          {vendorOptions.map((v) => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* 상태 */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">상태</label>
        <select
          className="border p-2 rounded-lg min-w-[140px]"
          value={value.status || ""}
          onChange={(e) => set({ status: e.target.value || undefined })}
        >
          <option value="">전체</option>
          <option value="CREATED">생성</option>
          <option value="APPROVED">승인</option>
          <option value="REJECTED">반려</option>
        </select>
      </div>

      {/* 액션 */}
      <button
        type="button"
        className="ml-auto px-3 py-2 rounded-xl border"
        onClick={reset}
      >
        초기화
      </button>
    </div>
  );
}
