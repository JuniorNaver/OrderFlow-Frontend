import dayjs from "dayjs";

export default function ReceiptView({ receipt }) {
  if (!receipt) return null;

  return (
    <div
      id="receipt-print"
      className="bg-white text-gray-800 font-mono p-4 rounded-lg shadow-sm w-full"
    >
      {/* 헤더 */}
      <div className="text-center border-b border-gray-300 pb-2 mb-2">
        <h2 className="text-lg font-bold">{receipt.storeName}</h2>
        <p className="text-xs">{receipt.storeAddress}</p>
        <p className="text-xs text-gray-500 mt-1">
          {dayjs(receipt.issuedAt).format("YYYY-MM-DD HH:mm:ss")}
        </p>
        <p className="text-xs">No. {receipt.receiptNo}</p>
      </div>

      {/* ✅ 상품 내역 */}
        {receipt.items && receipt.items.length > 0 && (
        <div className="mt-3">
            <h3 className="font-semibold border-b pb-1">상품 내역</h3>
            <ul className="mt-2 text-sm">
            {receipt.items.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                <span>{item.productName} x {item.salesQuantity}</span>
                <span>{item.subtotal.toLocaleString()}원</span>
                </li>
            ))}
            </ul>
        </div>
        )}

      <hr className="border-t border-gray-300 my-2" />

      {/* 결제 내역 */}
      <div className="text-sm">
        <p className="font-bold mb-1">결제 내역</p>
        {receipt.payments?.map((p, i) => (
          <div key={i} className="flex justify-between">
            <span>
              {p.paymentMethod === "CARD"
                ? "💳 카드결제"
                : p.paymentMethod === "CASH"
                ? "💵 현금결제"
                : "📱 간편결제"}
            </span>
            <span>₩{p.paidAmount.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <hr className="border-t border-gray-300 my-2" />

      {/* 총합 */}
      <div className="flex justify-between font-bold text-base">
        <span>총 합계</span>
        <span>₩{receipt.totalAmount.toLocaleString()}</span>
      </div>

      {/* 하단 안내 */}
      <div className="text-center text-xs text-gray-500 mt-3 border-t border-gray-200 pt-2">
        <p>본 영수증은 전자문서로 발행되었습니다.</p>
        <p>교환 및 환불은 7일 이내 가능합니다.</p>
      </div>
    </div>
  );
}
