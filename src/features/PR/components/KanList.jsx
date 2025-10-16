import KanRow from "./KanRow";

export default function KanList({ items, emptyLabel='해당 코너의 KAN이 없습니다' }) {
  if (!items?.length) return <div className="muted">{emptyLabel}</div>;
  return (
    <ul className="kan-list">
      {items.map(k => <KanRow key={k.id} item={k} />)}
    </ul>
  );
}