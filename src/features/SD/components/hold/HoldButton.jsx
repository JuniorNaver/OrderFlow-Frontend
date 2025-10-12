import { useState } from "react";

function HoldButton({
  onHold,           
  onHoldList,
  onResume,
  holdList,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openList, setOpenList] = useState(false);

  return (
    <div className="relative">
      {/* 메인 버튼 */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="bg-yellow-500 text-white w-40 h-20 rounded-2xl 
                   hover:bg-yellow-600 text-xl font-bold shadow-lg 
                   transition-transform active:scale-95"
      >
        보류
      </button>

      {/* 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="absolute top-[85px] left-0 flex flex-col w-40 bg-white 
                       rounded-xl shadow-lg border z-30 overflow-hidden">
          <button
            onClick={() => {
              onHold(); // ✅ 실제 로직은 부모에서 실행
              setMenuOpen(false);
            }}
            className="text-black hover:bg-yellow-100 py-3 text-sm font-semibold border-b"
          >
            주문 보류
          </button>
          <button
            onClick={async () => {
              await onHoldList();
              setOpenList(!openList);
              setMenuOpen(false);
            }}
            className="text-black hover:bg-gray-100 py-3 text-sm font-semibold"
          >
            보류 목록
          </button>
        </div>
      )}

      {/* 보류 목록 */}
      {openList && holdList.length > 0 && (
        <div className="absolute top-[180px] bg-white shadow-2xl border p-4 rounded-2xl 
                       w-64 max-h-60 overflow-y-auto z-20">
          <h3 className="font-bold text-center mb-2">📋 보류된 주문</h3>
          {holdList.map((order) => (
            <div
                key={order.orderId}
                className="flex justify-between items-center py-2 border-b"
            >
                {/* ✅ 사람이 보는 주문번호 표시 (예: 20251013-001) */}
                <span className="font-semibold">
                #{order.orderNo || order.orderId}
                </span>

                <button
                onClick={() => {
                    onResume(order.orderId); // ⚠️ 여긴 그대로! PK로 API 호출해야 함
                    setOpenList(false);
                }}
                className="bg-blue-500 text-white px-2 py-1 rounded-lg 
                            hover:bg-blue-600 text-sm transition"
                >
                재개
                </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HoldButton;