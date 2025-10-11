

/**
 * @param {{
 *  disabled:boolean,
 *  onSubmit:()=>void,
 *  onExport:()=>void,
 *  onReset:()=>void,
 *  submitting?:boolean,   // 선택: 로딩 표시용
 * }} props
 */
export default function OrderToolbar({
  disabled = false,
  onSubmit = () => {},
  onExport = () => {},
  onReset = () => {},
  submitting = false,
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="px-4 py-2 rounded-xl border shadow-sm disabled:opacity-50"
        onClick={onReset}
        disabled={submitting}
        title="입력 초기화 (Ctrl+Backspace)"
      >
        초기화
      </button>

      <button
        type="button"
        className="px-4 py-2 rounded-xl border shadow-sm"
        onClick={onExport}
        title="CSV로 내보내기"
      >
        CSV 내보내기
      </button>

      <div className="flex-1" />

      <button
        type="button"
        className="px-4 py-2 rounded-2xl border shadow-sm bg-white disabled:opacity-50"
        onClick={onSubmit}
        disabled={disabled || submitting}
        title="발주 생성 (Ctrl+Enter)"
      >
        {submitting ? "생성 중…" : "발주 생성"}
      </button>
    </div>
  );
}
