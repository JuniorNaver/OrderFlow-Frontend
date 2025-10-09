export default function RefundReason({ value, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-sm text-gray-600">환불 사유</label>
      <textarea
        className="w-full border rounded-2xl px-3 py-2 h-24"
        placeholder="예: 단순변심/불량/오배송 등"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}