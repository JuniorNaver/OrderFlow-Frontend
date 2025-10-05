/* eslint-disable no-unused-vars */
// src/features/BI/api/biApi.js

const mockDelay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function fetchKpis(_filters) {
  await mockDelay(300);
  return {
    totalSales: 128_450_000,
    orders: 5_432,
    avgBasket: 23_650,
    inventoryTurn: 8.2,
  };
}

export async function fetchSalesTrend(_filters) {
  await mockDelay(350);
  const days = 14;
  const base = 6_000_000;
  return Array.from({ length: days }).map((_, i) => ({
    date: new Date(Date.now() - (days - i) * 86_400_000)
      .toISOString()
      .slice(5, 10),
    sales: Math.round(base + Math.random() * 4_000_000),
    forecast: Math.round(base + 1_000_000 + Math.random() * 3_000_000),
  }));
}

export async function fetchCategorySales(_filters) {
  await mockDelay(320);
  return [
    { category: "음료", sales: 34_200_000 },
    { category: "스낵", sales: 29_900_000 },
    { category: "즉석식품", sales: 22_100_000 },
    { category: "아이스크림", sales: 18_700_000 },
    { category: "생활용품", sales: 12_300_000 },
  ];
}

export async function fetchInventoryStatus(_filters) {
  await mockDelay(280);
  return [
    { name: "정상 재고", value: 62 },
    { name: "임계치 근접", value: 23 },
    { name: "유통기한 임박", value: 11 },
    { name: "불일치 점검", value: 4 },
  ];
}
