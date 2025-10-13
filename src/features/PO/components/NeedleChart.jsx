import React, { useEffect, useRef } from "react";
import { PieChart, Pie, Cell } from "recharts";

export default function NeedleChart({ value = 70, max = 100 }) {
  const needleRef = useRef(null);

  const data = [
    { name: "낮음", value: max / 3, color: "#34d399" }, // 초록
    { name: "보통", value: max / 3, color: "#facc15" }, // 노랑
    { name: "높음", value: max / 3, color: "#f87171" }, // 빨강
  ];

  const cx = 150; // 중심 x
  const cy = 150; // 중심 y
  const iR = 50;  // 내부 반지름
  const oR = 120; // 외부 반지름
  const angle = 180 * (value / max); // 바늘 회전 각도

  useEffect(() => {
    if (needleRef.current) {
      needleRef.current.setAttribute("transform", `rotate(${angle}, ${cx}, ${cy})`);
    }
  }, [angle]);

  return (
    <div className="flex flex-col items-center">
      <div className="shadow-md rounded-md bg-white p-2">
        <PieChart width={300} height={180}>
          {/* 게이지 배경 */}
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx={cx}
            cy={cy}
            innerRadius={iR}
            outerRadius={oR}
            stroke="none"
            className="drop-shadow"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

          {/* 바늘 + 중심부 */}
          <g filter="drop-shadow(0px 0px 2px rgba(0,0,0,0.25))">
            {/* 바늘 (삼각형 형태로 변경) */}
            <path
              ref={needleRef}
              d={`M ${cx - 4} ${cy} L ${cx + 4} ${cy} L ${cx} ${cy - oR + 15} Z`}
              fill="#1f2937"
              className="transition-transform duration-400 ease-out"
            />

            {/* 중심부 (금속 느낌 + 약한 그림자) */}
            <circle
              cx={cx}
              cy={cy}
              r={9}
              fill="url(#centerGradient)"
              stroke="#555"
              strokeWidth={1.2}
              className="drop-shadow-sm"
            />
            <defs>
              <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f3f4f6" />
                <stop offset="100%" stopColor="#9ca3af" />
              </radialGradient>
            </defs>
          </g>
        </PieChart>
      </div>

      {/* 값 라벨 */}
      <div className="text-sm text-gray-700 font-semibold mt-3 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
        현재 값: <span className="text-gray-900 font-bold">{value}</span> / {max}
      </div>
    </div>
  );
}
