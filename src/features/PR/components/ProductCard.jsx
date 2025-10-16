export default function ProductCard({ p }) {
  return (
    <div className="border rounded-2xl bg-white p-3">
      <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden grid place-items-center">
        {p.image ? (
          <img src={p.image} alt={p.name} className="object-cover w-full h-full" />
        ) : (
          <div className="text-xs text-gray-400">이미지 없음</div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <div className="text-sm text-gray-500">{p.gtin}</div>
        <div className="text-sm font-medium line-clamp-2">{p.name}</div>
        <div className="text-base font-semibold">
          {p.price ? Number(p.price).toLocaleString() : "-"}
          <span className="ml-1 text-sm text-gray-500">{p.unit || ""}</span>
        </div>
      </div>
      <button
        className={`mt-3 w-full rounded-xl text-sm py-2 ${
          p.orderable ? "bg-gray-900 text-white hover:opacity-90" : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!p.orderable}
      >
        담기
      </button>
    </div>
  );
}