import React from "react";

export default function BudgetBar({ month = "3월", used, order, budget }) {
  const total = used + order;
  const isOver = total > budget;

  // 전체 계산 기준: 예전에 사용한 방식과 달리
  // 막대의 전체 길이는 "max(total, budget)" 으로 잡습니다.
  const totalForCalc = Math.max(total, budget);

  const usedPercent = Math.min((used / totalForCalc) * 100, 100);
  const orderPercent = Math.min((order / totalForCalc) * 100, 100 - usedPercent);
  const budgetPercent = Math.min((budget / totalForCalc) * 100, 100);

  const overAmount = isOver ? total - budget : 0;

  return (
    <div className="w-full max-w-4xl mt-6 pt-4 mx-auto">
      {/* 상단 라벨 */}
      <div className="flex justify-between items-end mb-2">
        <span className="text-gray-700 font-semibold text-sm">{month} 발주금액</span>

        {/* 예산 초과 아닐 때만 우측 예산 표시 */}
        {!isOver && (
          <span className="text-gray-800 font-semibold text-sm">
            {budget.toLocaleString()}
          </span>
        )}
      </div>

      {/* 여기 부모를 relative로 잡아서 기준선은 이 부모 기준으로 위치시킴 */}
      <div className="relative">
        {/* 진행 바 (여기는 overflow-hidden 유지) */}
        <div className="relative w-full h-8 bg-gray-200 border border-gray-400 rounded-sm overflow-hidden z-0">
          {/* 사용 예산 (왼쪽) */}
          <div
            className="absolute top-0 left-0 bg-green-400 h-8 flex justify-center items-center text-xs text-gray-900 font-semibold z-10"
            style={{ width: `${usedPercent}%` }}
          >
            {used.toLocaleString()}원
          </div>

          {/* 발주 예산 */}
          <div
            className={`absolute top-0 h-8 flex justify-center items-center text-xs font-semibold z-10 ${
              isOver ? "bg-red-400 text-white" : "bg-green-600 text-gray-900"
            }`}
            style={{ width: `${orderPercent}%`, left: `${usedPercent}%` }}
          >
            {order.toLocaleString()}원
          </div>
        </div>

        {/* ✅ 기준선 */}
        {isOver && (
          <div
            className="absolute -top-8 transform -translate-x-1/2 text-xs font-semibold text-gray-900 text-center z-20"
            style={{ left: `${budgetPercent}%` }}
          >
            <div>{budget.toLocaleString()}</div>
            <div className="text-black">▼</div>
          </div>
        )}
      </div>

      {/* 예산 초과 안내 문구 (오른쪽 하단) */}
      {isOver && (
        <div className="relative">
          <p className="absolute right-0 text-red-600 text-sm mt-2 font-semibold">
            지정한 월 예산을 초과하였습니다. (초과 금액: {overAmount.toLocaleString()}원)
          </p>
        </div>
      )}
    </div>
  );
}