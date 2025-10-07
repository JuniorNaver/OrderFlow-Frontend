import PaymentSection from "../components/PaymentSection";

export default function SalesRegister() {
    const handlePaymentSelect = (method) => {
        console.log("선택된 결제방식:", method);
    };
  return (
    <div className="p-10 bg-gray-50 min-h-screen text-[18px]">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">판매등록</h1>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="grid grid-cols-3 gap-10">
        {/* 📋 왼쪽: 판매등록 테이블 */}
        <div className="col-span-2 bg-white shadow-xl rounded-2xl p-6">
          <table className="w-full border-collapse text-lg">
            <thead className="border-b bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-3 text-left w-[60px]">NO</th>
                <th className="p-3 text-left">제품명</th>
                <th className="p-3 text-right w-[120px]">단가</th>
                <th className="p-3 text-center w-[160px]">수량</th>
                <th className="p-3 text-right w-[80px]">재고</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((no) => (
                <tr key={no} className="border-b hover:bg-gray-50 text-gray-800">
                  <td className="p-3">{no}</td>
                  <td className="p-3">햇반(100g) 01584123</td>
                  <td className="p-3 text-right">
                    ₩{(no * 1000).toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <button className="px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 text-lg">
                        -
                      </button>
                      <span className="w-[30px] text-center">0</span>
                      <button className="px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 text-lg">
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-right">{no * 5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 💳 오른쪽: 결제 / 환불 / 조회 / 검색 */}
        <div className="grid grid-cols-2 gap-6 justify-items-center">
         <PaymentSection totalAmount={10000} onSelect={handlePaymentSelect} />

         <button className="bg-red-500 text-white w-40 h-20 rounded-2xl 
                     hover:bg-red-600 text-xl font-bold shadow-lg 
                     transition-transform active:scale-95">
            환불
        </button>

        {/* 2행 */}
        <button className="bg-gray-900 text-white w-40 h-20 rounded-2xl 
                     hover:bg-gray-800 text-xl font-bold shadow-lg 
                     transition-transform active:scale-95">
            영수증
        </button>
        <button className="bg-green-500 text-white w-40 h-20 rounded-2xl 
                     hover:bg-green-600 text-xl font-bold shadow-lg 
                     transition-transform active:scale-95">
            보류
        </button>

        {/* 3행 */}
        <button className="bg-yellow-400 text-white w-40 h-20 rounded-2xl 
                     hover:bg-yellow-500 text-xl font-bold shadow-lg 
                     transition-transform active:scale-95">
            상품 검색
        </button>
        <button className="bg-purple-500 text-white w-40 h-20 rounded-2xl 
                     hover:bg-purple-600 text-xl font-bold shadow-lg 
                     transition-transform active:scale-95">
            재고조정
        </button>
        </div>
      </div>

      {/* 하단 요약 영역 */}
      <div className="mt-10 bg-white shadow-xl rounded-2xl p-6 grid grid-cols-2 gap-8 text-lg">
        <div>
          <div className="flex justify-between border-b py-2">
            <span>총 매출</span>
            <span>₩ 10,000</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>할인액</span>
            <span>₩ 0</span>
          </div>
          <div className="flex justify-between font-bold text-blue-600 py-2 text-xl">
            <span>결제금액</span>
            <span>₩ 10,000</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between border-b py-2">
            <span>받을 금액</span>
            <span>₩ 10,000</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>받은 금액</span>
            <span>₩ 10,000</span>
          </div>
          <div className="flex justify-between font-bold text-green-600 py-2 text-xl">
            <span>거스름돈</span>
            <span>₩ 0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
