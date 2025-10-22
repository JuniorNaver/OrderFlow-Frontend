import { useState, useEffect } from "react";
import { getHolds, deleteHoldOffline as deleteHold } from "../../api/holdMAnager";
import HoldDetailModal from "./HoldDetailModal";

export default function HoldModal({ onClose, onLoadHold }) {
  const [holds, setHolds] = useState([]);
  const [selectedHold, setSelectedHold] = useState(null);

  useEffect(() => {
  (async () => {
    const data = await getHolds();
    console.log("📦 getHolds 결과:", data);
    setHolds(Array.isArray(data) ? data : []); // 혹시 null이나 객체면 빈 배열로 처리
  })();
}, []);

  const handleDelete = (id) => {
    deleteHold(id);
    setHolds(getHolds());
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[600px] shadow-lg">
        <h2 className="text-2xl font-bold mb-4">🧾 보류 목록</h2>

        {Array.isArray(holds) && holds.length > 0 ? (
            <ul className="space-y-3">
              {holds.map((hold) => (
                <li key={hold.id} className="flex justify-between items-center border-b pb-2">
                  <span>{new Date(hold.createdAt).toLocaleString()}</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedHold(hold)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                    >
                      상세보기
                    </button>
                    <button
                      onClick={() => handleDelete(hold.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>저장된 보류 항목이 없습니다.</p>
          )}


        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
          >
            닫기
          </button>
        </div>
      </div>

      {selectedHold && (
        <HoldDetailModal
          hold={selectedHold}
          onClose={() => setSelectedHold(null)}
          onLoadHold={onLoadHold}
        />
      )}
    </div>
  );
}