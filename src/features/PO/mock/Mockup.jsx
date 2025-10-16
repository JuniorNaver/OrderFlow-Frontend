export const mockItems = [
  { itemNo: 1, productName: "햇반(100g)", gtin: "01584123", price: 1000, margin: 500, qty: 2 },
  { itemNo: 2, productName: "진라면", gtin: "09843122", price: 1200, margin: 600, qty: 1 },
  { itemNo: 3, productName: "코카콜라 500ml", gtin: "8801234560012", price: 9000, margin: 4500, qty: 100 },
  { itemNo: 4, productName: "삼다수 2L", gtin: "8801234560011", price: 1200, margin: 600, qty: 3 },
  { itemNo: 5, productName: "비비고 왕교자", gtin: "8801234560028", price: 9800, margin: 4900, qty: 2 },
  { itemNo: 6, productName: "서울우유 1L", gtin: "8801234560035", price: 2600, margin: 1300, qty: 1 },
  { itemNo: 7, productName: "농심 새우깡", gtin: "8801234560042", price: 1500, margin: 750, qty: 5 },
  { itemNo: 8, productName: "CJ 햇반컵밥 불고기덮밥", gtin: "8801234560059", price: 3900, margin: 1950, qty: 2 },
  { itemNo: 9, productName: "오뚜기 진짬뽕", gtin: "8801234560066", price: 1400, margin: 700, qty: 4 },
  { itemNo: 10, productName: "코카콜라 1.5L", gtin: "8801234560073", price: 2300, margin: 1150, qty: 6 },
];

export const mockWarehouseData = {
  room: { current: 600, incoming: 200, capacity: 1000 },
  cold: { current: 400, incoming: 100, capacity: 800 },
  frozen: { current: 300, incoming: 50, capacity: 600 },
};

export const mockSavedCarts = [
  {
    itemNo: "cart-001",
    name: "2월 발주 리스트",
    date: "2025-02-20",
    items: [
      { itemNo: 11, productName: "코카콜라 1.5L", price: 2300, margin: 1150, qty: 10 },
      { itemNo: 12, productName: "삼다수 2L", price: 1200, margin: 600, qty: 5 },
    ],
  },
  {
    itemNo: "cart-002",
    name: "3월 초 매입 리스트",
    date: "2025-03-02",
    items: [
      { itemNo: 21, productName: "햇반컵밥 불고기덮밥", price: 3900, margin: 1950, qty: 3 },
      { itemNo: 22, productName: "비비고 왕교자", price: 9800, margin: 4900, qty: 2 },
    ],
  },
  {
    itemNo: "cart-003",
    name: "테스트용 장바구니",
    date: "2025-03-15",
    items: [
      { itemNo: 31, productName: "진라면 매운맛", price: 1300, margin: 600, qty: 4 },
      { itemNo: 32, productName: "농심 새우깡", price: 1500, margin: 750, qty: 6 },
    ],
  },
];