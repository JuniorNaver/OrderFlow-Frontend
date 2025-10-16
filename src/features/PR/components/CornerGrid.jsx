import CornerCard from "./CornerCard";

export default function CornerGrid({ corners, selectedId, onSelect }) {
  if (!corners?.length) return <div className="muted">코너 없음</div>;
  return (
    <div className="corner-grid">
      {corners.map(c => (
        <CornerCard key={c.id} corner={c} selected={selectedId===c.id} onSelect={onSelect} />
      ))}
    </div>
  );
}