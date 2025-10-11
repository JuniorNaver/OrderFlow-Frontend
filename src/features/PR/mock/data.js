// 간단 더미 상품 12개
export const MOCK_PRODUCTS = [
  { productCode: "88010001", name: "코카콜라 500ml", unitPrice: 1800 },
  { productCode: "88010002", name: "진라면 매운맛", unitPrice: 850 },
  { productCode: "88010003", name: "삼다수 2L", unitPrice: 1200 },
  { productCode: "88010004", name: "비비고 왕교자", unitPrice: 9800 },
  { productCode: "88010005", name: "서울우유 1L", unitPrice: 2600 },
  { productCode: "88010006", name: "새우깡", unitPrice: 1500 },
  { productCode: "88010007", name: "햇반(100g)", unitPrice: 1000 },
  { productCode: "88010008", name: "오뚜기 진짬뽕", unitPrice: 1400 },
  { productCode: "88010009", name: "코카콜라 1.5L", unitPrice: 2300 },
  { productCode: "88010010", name: "컵누들", unitPrice: 1200 },
  { productCode: "88010011", name: "포카칩 오리지널", unitPrice: 1700 },
  { productCode: "88010012", name: "초코파이", unitPrice: 3000 },
];

// 이미지 플레이스홀더(코드마다 고정된 랜덤 이미지)
export const placeholder = (seed, size = 300) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
