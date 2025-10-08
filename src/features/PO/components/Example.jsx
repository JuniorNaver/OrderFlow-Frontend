import React from "react";
import BudgetBar from "./BudgetBar";

export default function Example() {
  return (
    <div className="p-6">
      {/* 1️⃣ 예산 이내 */}
      <BudgetBar
        used={1500000}
        order={400000}
        budget={2000000}
        monthLabel="3월 발주금액"
      />

      <div className="my-8" />

      {/* 2️⃣ 예산 초과 */}
      <BudgetBar
        used={1800100}
        order={1100000}
        budget={2000000}
        monthLabel="3월 발주금액"
      />
    </div>
  );
}