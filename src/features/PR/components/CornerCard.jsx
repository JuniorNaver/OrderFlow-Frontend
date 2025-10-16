import { fmtCount } from "../util/format";

export default function CornerCard({ corner, selected, onSelect }) {
  return (
    <button className={`corner-card ${selected ? 'selected' : ''}`}
            onClick={() => onSelect(corner.id)}
            title={corner.name || '기타'}>
      <div className="corner-name">{corner.name || '기타'}</div>
      <div className="corner-meta">KAN {fmtCount(corner.categoryCount)}</div>
    </button>
  );
}