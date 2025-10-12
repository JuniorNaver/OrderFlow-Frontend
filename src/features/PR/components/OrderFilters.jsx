/**
 * @param {{
 *  value: { from?:string, to?:string, vendorId?:string, status?:string, q?:string },
 *  onChange: (next:any)=>void,
 *  vendorOptions?: {label:string, value:string}[],
 *  autoApply?: boolean,           // true면 입력 시 디바운스 적용, false면 '적용' 버튼 노출
 *  debounceMs?: number,           // autoApply일 때 디바운스 시간
 *  showQuickRanges?: boolean      // 빠른기간 버튼 노출
 * }} props
 */
import { useEffect, useMemo, useState } from "react";

export default function OrderFilters({
  value = {},
  onChange = () => {},
  vendorOptions = [],
  autoApply = true,
  debounceMs = 250,
  showQuickRanges = true,
}) {
  const [local, setLocal] = useState(value);

  // 외부 value 변경 시 로컬 동기화
  useEffect(() => setLocal(value ?? {}), [value]);

  // YYYY-MM-DD 포맷터
  const fmt = (d) => d.toISOString().slice(0,10);

  // 빠른 기간 버튼 헬퍼
  const setRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setLocal(v => ({ ...v, from: fmt(start), to: fmt(end) }));
  };

  // 값 정규화: 빈 문자열 제거, 날짜 유효성 체크
  const normalized = useMemo(() => {
    const n = { ...local };
    for (const k of Object.keys(n)) if (n[k] === "") delete n[k]; // "" -> undefined
    if (n.from && n.to && n.from > n.to) {
      // 잘못된 범위면 from을 to로 맞춤
      n.from = n.to;
    }
    return n;
  }, [local]);

  // 자동 적용 모드: 디바운스로 onChange 호출
  useEffect(() => {
    if (!autoApply) return;
    const t = setTimeout(() => onChange(normalized), debounceMs);
    return () => clearTimeout(t);
  }, [normalized, autoApply, debounceMs, onChange]);

  const apply = () => onChange(normalized);
  const reset = () => onChange({});

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* 기간 */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">시작일</label>
        <input
          type="date"
          className="border p-2 rounded-lg"
          value={local.from || ""}
          onChange={(e) => setLocal(v => ({ ...v, from: e.target.value }))}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">종료일</label>
        <input
          type="date"
          className="border p-2 rounded-lg"
          value={local.to || ""}
          onChange={(e) => setLocal(v => ({ ...v, to: e.target.value }))}
        />
      </div>

      {showQuickRanges && (
        <div className="flex gap-1 pb-1">
          <button type="button" className="px-2 py-1 border rounded-lg" onClick={() => setRange(1)}>오늘</button>
          <button type="button" className="px-2 py-1 border rounded-lg" onClick={() => setRange(7)}>7일</button>
          <button type="button" className="px-2 py-1 border rounded-lg" onClick={() => setRange(30)}>30일</button>
        </div>
      )}

      {/* 공급업체 */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">공급업체</label>
        <select
          className="border p-2 rounded-lg min-w-[160px]"
          value={local.vendorId || ""}
          onChange={(e) => setLocal(v => ({ ...v, vendorId: e.target.value || undefined }))}
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
          value={local.status || ""}
          onChange={(e) => setLocal(v => ({ ...v, status: e.target.value || undefined }))}
        >
          <option value="">전체</option>
          <option value="CREATED">생성</option>
          <option value="APPROVED">승인</option>
          <option value="REJECTED">반려</option>
        </select>
      </div>

      {/* 키워드(옵션) */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">키워드</label>
        <input
          className="border p-2 rounded-lg min-w-[180px]"
          placeholder="상품코드/이름 검색"
          value={local.q || ""}
          onChange={(e) => setLocal(v => ({ ...v, q: e.target.value }))}
        />
      </div>

      {/* 액션 */}
      <div className="ml-auto flex gap-2">
        {!autoApply && (
          <button
            type="button"
            className="px-3 py-2 rounded-xl border bg-black text-white hover:opacity-90"
            onClick={apply}
          >
            적용
          </button>
        )}
        <button
          type="button"
          className="px-3 py-2 rounded-xl border"
          onClick={reset}
        >
          초기화
        </button>
      </div>
    </div>
  );
}
