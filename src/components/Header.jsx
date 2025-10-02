import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, Settings } from "lucide-react";
import Logo from "./Logo";
import Drawer from "./Drawer";

export default function Header() {
  const [isPOS, setIsPOS] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const togglePOS = () => {
    setIsPOS(!isPOS);
    if (!isPOS) {
      navigate("/sd");
    } else {
      navigate("/bi");
    }
  };

  const posMenus = [
    { label: "결제", path: "/sd/payment" },
    { label: "환불", path: "/sd/refund" },
    { label: "판매내역 조회", path: "/sd/sales" },
    { label: "영수증 조회", path: "/sd/receipt" },
  ];

  const stockMenus = [
    { label: "발주(PR)", path: "/pr" },
    { label: "발주(PO)", path: "/po" },
    { label: "입고(GR)", path: "/gr" },
    { label: "재고관리(STK)", path: "/stk" },
    { label: "BI 대시보드", path: "/bi" },
  ];

  const menus = isPOS ? posMenus : stockMenus;

  return (
    <header className="fixed top-0 left-0 w-full h-16 flex items-center justify-between px-4 shadow-md bg-white z-50">
      {/* 왼쪽 */}
      <div className="flex items-center gap-4">
        {/* 햄버거 버튼 */}
        <button
          className="p-2 hover:bg-gray-100 rounded-lg"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* 데스크톱 전용 토글 */}
        <div
          className="relative w-32 h-9 bg-gray-200 rounded-full items-center cursor-pointer select-none hidden md:flex"
          onClick={togglePOS}
        >
          <div
            className={`absolute top-1 left-1 w-14 h-7 rounded-full bg-blue-500 transition-transform duration-300 ease-out ${
              isPOS ? "translate-x-16" : "translate-x-0"
            }`}
          />
          <div className="relative z-10 flex w-full h-full">
            <div
              className={`flex-1 flex items-center justify-center font-bold text-sm ${
                !isPOS ? "text-white" : "text-gray-600"
              }`}
            >
              재고
            </div>
            <div
              className={`flex-1 flex items-center justify-center font-bold text-sm ${
                isPOS ? "text-white" : "text-gray-600"
              }`}
            >
              POS
            </div>
          </div>
        </div>

        {/* 로고 */}
        <Logo />
      </div>

      {/* 네비게이션 (데스크톱 전용) */}
      <nav className="flex-1 justify-center gap-6 hidden md:flex">
        {menus.map((menu) => (
          <NavLink
            key={menu.label}
            to={menu.path}
            className={({ isActive }) =>
              `whitespace-nowrap transition-all ${
                isActive
                  ? "text-xl font-bold text-blue-600"
                  : "text-sm text-gray-500 hover:text-gray-700"
              }`
            }
          >
            {menu.label}
          </NavLink>
        ))}
      </nav>

      {/* 오른쪽 */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <span className="hidden sm:inline text-xs md:text-sm font-mono text-gray-600 whitespace-nowrap">
          {dateTime.toLocaleString("ko-KR")}
        </span>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Settings size={22} />
        </button>
      </div>

      {/* 분리된 Drawer 컴포넌트 */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isPOS={isPOS}
        togglePOS={togglePOS}
        menus={menus}
      />
    </header>
  );
}
