import { Link } from "react-router-dom";

export default function POSDashboard() {
  return (
    <div className="p-6">
      {/* 타이틀 */}
      <h1 className="text-2xl font-bold mb-4">POS 대시보드</h1>
      <p className="text-gray-600 mb-8">
        오늘 매출 요약 및 최근 거래 현황을 확인할 수 있습니다.
      </p>

      {/* 간단한 카드형 위젯 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-sm text-gray-500">오늘 총 매출</h2>
          <p className="text-xl font-bold text-blue-600">₩ 1,245,000</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-sm text-gray-500">총 거래 건수</h2>
          <p className="text-xl font-bold text-green-600">84 건</p>
        </div>
      </div>

      {/* 바로가기 메뉴 */}
      <div className="flex gap-4">
        <Link
          to="/sd/sales"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          결제
        </Link>
        <Link
          to="/sd/refund"
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          환불
        </Link>
        <Link
          to="/sd/sales"
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          판매내역 조회
        </Link>
        <Link
          to="/sd/receipt"
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          영수증 조회
        </Link>
      </div>
    </div>
  );
}
