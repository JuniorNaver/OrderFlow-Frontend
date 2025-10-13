const stockMenus = [
  {
    label: "발주(PR)",
    path: "/pr",
    children: [
      { label: "상품 조회", path: "/pr/orders" },
      { label: "상품 추천", path: "/pr/recommend" },
      { label: "상품 검색", path: "/pr/search" },
      { label: "상품 발주하기", path: "/pr/shop" },
    ]
  },
  {
    label: "발주(PO)",
    path: "/po",
  },
  {
    label: "입고(GR)",
    path: "/gr",
  },
  {
    label: "재고관리(STK)",
    path: "/stk",
    children: [
      { label: "현재 재고 현황 조회", path: "/stk" }, 
      { label: "유통기한 현황", path: "/stk/expiry" },
      { label: "폐기 관리 페이지", path: "/stk/disposal" }, 
      { label: "재고 수량 조정", path: "/stk/adjust" }, 
    ],
  },
  {
    label: "BI 대시보드",
    path: "/bi",
    children: [
      { label: "예상 판매량 분석", path: "/bi/forecast" },
      { label: "KPI 분석", path: "/bi/kpi" },
      { label: "손익 분석", path: "/bi/profit" },
      { label: "발주 효율 분석", path: "/bi/order-efficiency" },
    ],
  },
];

export default stockMenus;
