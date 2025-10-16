export default function ZoneTabs({ value, onChange }) {
  const zones = [
    { id:'room', label:'실온' },
    { id:'chilled', label:'냉장' },
    { id:'frozen', label:'냉동' },
    { id:'other', label:'기타' },
  ];
  return (
    <div className="tabs">
      {zones.map(z => (
        <button key={z.id}
          className={`tab ${value===z.id ? 'active' : ''}`}
          onClick={() => onChange(z.id)}>
          {z.label}
        </button>
      ))}
    </div>
  );
}