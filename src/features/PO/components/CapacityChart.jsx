import React from "react";
import { PieChart, Pie, Cell } from "recharts";

export default function CapacityChart({ data }) {
  const COLORS = {
    current: "#2563eb", // 진한 파랑 (현재 채워진 양)
    incoming: "#93c5fd", // 연한 파랑 (발주시 채워질 양)
    empty: "#e5e7eb", // 회색 (남은 용량)
  };

  const renderCircle = (label, current, incoming, capacity) => {
    const currentPercent = (current / capacity) * 100;
    const incomingPercent = (incoming / capacity) * 100;
    const emptyPercent = Math.max(0, 100 - currentPercent - incomingPercent);

    const chartData = [
      { name: "현재", value: currentPercent, color: COLORS.current },
      { name: "발주 예정", value: incomingPercent, color: COLORS.incoming },
      { name: "여유", value: emptyPercent, color: COLORS.empty },
    ];

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-[120px] h-[120px] flex items-center justify-center">
          <PieChart width={120} height={120}>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={35}
              outerRadius={55}
              startAngle={90}
              endAngle={450}
              animationBegin={0}
              animationDuration={700}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>

          {/* 중앙 텍스트 */}
          <div className="absolute text-center">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-600">
              {current + incoming}/{capacity}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center bg-white shadow-md rounded-2xl px-6 py-6 space-y-6">
      {renderCircle("실온", data.room.current, data.room.incoming, data.room.capacity)}
      {renderCircle("냉장", data.cold.current, data.cold.incoming, data.cold.capacity)}
      {renderCircle("냉동", data.frozen.current, data.frozen.incoming, data.frozen.capacity)}
    </div>
  );
}
