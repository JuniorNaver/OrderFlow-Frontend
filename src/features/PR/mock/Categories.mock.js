export const CATEGORIES = [
{
    name: "가공식품",
    sub: [
      "즉석식품",
      "라면",
      "음료",
      "과자",
      "통조림",
      "조미료",
      "커피/코코아류",
    ],
  },
  {
    name: "신선식품",
    sub: ["농산물", "축산물", "수산물"],
  },
  {
    name: "일상용품",
    sub: ["위생용품", "청소용품", "생활잡화", "세탁용품"],
  },
  {
    name: "의약품",
    sub: ["일반의약품", "의료용품"],
  },
  {
    name: "교육/문구완구",
    sub: ["문구/사무용품"],
  },
  {
    name: "패션잡화",
    sub: ["의류", "가방", "모자", "양말"],
  },
];

// 간단 더미 상품 12개
export const MOCK_PRODUCTS = [
{ productCode: "88010001", name: "코카콜라 500ml",category: "가공식품", subCategory: "음료", unitPrice: 1800 },
{ productCode: "88010002", name: "진라면 매운맛", category: "가공식품", subCategory: "라면", unitPrice: 850  },
{ productCode: "88010003", name: "삼다수 2L", category: "가공식품", subCategory: "음료", unitPrice: 1200 },
{ productCode: "88010004", name: "비비고 왕교자",category: "가공식품", subCategory: "만두", unitPrice: 9800 },
{ productCode: "88010005", name: "서울우유 1L", category: "신선식품", subCategory: "음료",unitPrice: 2600,},
{ productCode: "88010006", name: "새우깡", category: "가공식품", subCategory: "과자", unitPrice: 1500 },
{ productCode: "88010007", name: "햇반(100g)", category: "가공식품", subCategory: "즉석식품", unitPrice: 1000 },
{ productCode: "88010008", name: "오뚜기 진짬뽕", category: "가공식품", subCategory: "라면", unitPrice: 1400 },
{ productCode: "88010009", name: "코카콜라 1.5L", category: "가공식품", subCategory: "음료", unitPrice: 2300 },
{ productCode: "88010010", name: "컵누들", category: "가공식품", subCategory: "라면", unitPrice: 1200 },
{ productCode: "88010011", name: "포카칩 오리지널", category: "가공식품", subCategory: "과자", unitPrice: 1700},
{ productCode: "88010012", name: "초코파이", category: "가공식품", subCategory: "과자", unitPrice: 3000 },
];

// 이미지 플레이스홀더(코드마다 고정된 랜덤 이미지)
export const placeholder = (seed, size = 320) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
