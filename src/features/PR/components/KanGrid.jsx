import SkeletonGrid from "../../../common/components/common/Skeleton";
import ErrorBlock from "../../../common/components/common/ErrorBlock";

export default function KanGrid({ items=[], onClick, loading, error }) {
  if (loading) return <SkeletonGrid count={9} />;
  if (error)   return <ErrorBlock message="카테고리를 불러오지 못했어요." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(it => (
        <button key={it.id}
          onClick={() => onClick?.(it)}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition text-left p-4 border">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{it.name}</div>
            <span className="text-xs bg-slate-100 rounded px-2 py-0.5">{it.id}</span>
          </div>
          <div className="text-sm text-slate-500 mt-1">상품 {it.childrenCount ?? 0}개</div>
        </button>
      ))}
    </div>
  );
}