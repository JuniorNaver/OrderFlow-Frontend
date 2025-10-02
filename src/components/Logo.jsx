import { useNavigate } from "react-router-dom";

export default function Logo({ size = 28, isPOS = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isPOS) {
      navigate("/sd");   // POS 모드일 때
    } else {
      navigate("/");     // ERP 모드일 때
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-2 select-none cursor-pointer"
    >
      {/* 아이콘 (그래프) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-bar-chart-2"
      >
        <line x1="18" x2="18" y1="20" y2="10" />
        <line x1="12" x2="12" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="14" />
      </svg>

      {/* 텍스트 */}
      <span className="font-bold text-xl">
        <span className="text-gray-800">Order</span>
        <span className="text-blue-600">Flow</span>
      </span>
    </div>
  );
}
