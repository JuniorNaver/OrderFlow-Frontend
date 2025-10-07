import React from "react";

export default function BudgetProgressBar({ month = "3월", used, order, budget }) {
  const totalAfterOrder = used + order;
  const overBudget = totalAfterOrder > budget;

  // 막대 비율 계산
  const usedPercent = Math.min((used / budget) * 100, 100);
  const orderPercent = Math.min((order / budget) * 100, 100 - usedPercent);

  return (
    <div className="mt-6  pt-4">
      <p className="text-gray-700 font-semibold mb-2 text-sm">{month} 발주금액</p>

      <div className="relative w-full h-8 bg-gray-200 rounded-sm overflow-hidden">
        {/* 사용한 금액 */}
        <div
          className="bg-green-200 h-8"
          style={{ width: `${usedPercent}%` }}
        ></div>

        {/* 이번 발주 금액 */}
        <div
          className="bg-red-500 h-8"
          style={{ width: `${orderPercent}%`, marginLeft: `${usedPercent}%` }}
        ></div>

        {/* 중앙 수치 텍스트 */}
        <div className="absolute inset-0 flex justify-center items-center text-sm font-semibold text-gray-700">
          {used.toLocaleString()}원
        </div>
      </div>

      {/* 기준선 및 금액 */}
      <div className="flex justify-between mt-1 text-sm text-gray-700">
        <span>{used.toLocaleString()}원</span>
        <span>{budget.toLocaleString()}원</span>
      </div>

      {/* 예산 초과 메시지 */}
      {overBudget && (
        <p className="text-red-600 mt-2 text-sm font-semibold text-center">
          지정한 월 예산을 초과하였습니다.
        </p>
      )}
    </div>
  );
}