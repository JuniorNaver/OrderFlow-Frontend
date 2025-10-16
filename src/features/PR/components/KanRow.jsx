import { fmtCount } from "../util/format";

export default function KanRow({ item, onClick }) {
  return (
    <li className="kan-row" onClick={() => onClick?.(item)}>
      <div>
        <div className="kan-name">{item.name || '기타'}</div>
        <div className="kan-id">KAN: {item.id}</div>
      </div>
      <div className="kan-count">{fmtCount(item.childrenCount)}개 상품</div>
    </li>
  );
}