export default function HoldDetailModal({ hold, onClose, onLoadHold }) {
  const handleLoad = () => {
    onLoadHold(hold.items);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[500px] shadow-lg">
        <h2 className="text-2xl font-bold mb-4">🧺 보류 상세보기</h2>

        <ul className="border p-3 rounded-lg max-h-60 overflow-y-auto">
          {hold.items.map((item, idx) => (
            <li key={idx} className="flex justify-between py-1 border-b">
              <span>{item.name}</span>
              <span>{item.qty}개</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={handleLoad}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            불러오기
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
