export default function Breadcrumbs({ items = [] }) {
  const visible = items.filter(Boolean);
  return (
    <nav className="text-sm text-gray-500">
      {visible.length === 0 ? <span>전체</span> : visible.map((x, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-2">/</span>}
          {x}
        </span>
      ))}
    </nav>
  );
}
