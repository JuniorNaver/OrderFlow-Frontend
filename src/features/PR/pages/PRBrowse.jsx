import React, {useEffect, useMemo, useState} from "react";
import { Sun, Refrigerator, Snowflake, PackageOpen } from "lucide-react";
import { fetchCorners, fetchCategories } from "../api/browse";

const ZONES = [
  { key: "room",    label: "실온", icon: <Sun className="h-5 w-5" /> },
  { key: "chilled", label: "냉장", icon: <Refrigerator className="h-5 w-5" /> },
  { key: "frozen",  label: "냉동", icon: <Snowflake className="h-5 w-5" /> },
  { key: "other",   label: "기타", icon: <PackageOpen className="h-5 w-5" /> },
];

const slug = (s) => (s || "").trim().replace(/\s+/g, "_");
const unslug = (s) => (s || "").replace(/_/g, " ");

export default function PRBrowse() {
  const [zone, setZone] = useState("room");     // 내부값은 영문 키 권장
  const [corners, setCorners] = useState([]);   // [{id,name,categoryCount}]
  const [kans, setKans] = useState([]);         // [{id,name,childrenCount}]
  const [cornerId, setCornerId] = useState(null);
  
  // 상품 관련
  const [products, setProducts] = useState([]); 
  const [loadingCorners, setLoadingCorners] = useState(false);
  const [loadingKans, setLoadingKans] = useState(false);
  const [loadingProds, setLoadingProds] = useState(false);
  const [error, setError] = useState(null);

  // 존 변경 → 코너 로드
  useEffect(() => {
    let abort = false;
    setLoadingCorners(true);
    setCornerId(null);
    setKans([]);
    setProducts([]);
    setError(null);

    fetchCorners(zone)
      .then(data => { if (!abort) setCorners(data); })
      .catch(e => { if (!abort) { setCorners([]); setError(e.message); } })
      .finally(() => { if (!abort) setLoadingCorners(false); });

    return () => { abort = true; };
  }, [zone]);

  // 코너 선택 → KAN 로드
  useEffect(() => {
    if (!cornerId) return;
    let abort = false;
    setLoadingKans(true);
    setKans([]);
    setProducts([]);
    setError(null);

    fetchCategories(zone, cornerId)
      .then(data => { if (!abort) setKans(data); })
      .catch(e => { if (!abort) { setKans([]); setError(e.message); } })
      .finally(() => { if (!abort) setLoadingKans(false); });

    return () => { abort = true; };
  }, [zone, cornerId]);

  // KAN 클릭 → 상품 로드
  async function onClickKan(kanCode) {
    setLoadingProds(true);
    setProducts([]);
    setError(null);
    try {
      const data = await fetchProducts(kanCode, 0, 20);
      setProducts(data); // [{gtin,name,unit,price,imageUrl,orderable}]
    } catch (e) {
      setError(e.message || "상품을 불러오지 못했어요.");
    } finally {
      setLoadingProds(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더: 존 탭 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="h-8 w-8 rounded-xl bg-black text-white grid place-items-center">OF</div>
            <span>OrderFlow 발주(PR)</span>
          </div>
          <nav className="flex gap-2">
            {ZONES.map(z => (
              <button
                key={z.key}
                className={`px-3 py-1.5 rounded-xl border ${zone===z.key?'bg-black text-white':'bg-white'}`}
                onClick={() => setZone(z.key)}
                title={z.label}
              >
                {z.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6 space-y-6">
        {/* 코너 선택기 */}
        <div className="rounded-2xl border bg-white p-4 space-y-3">
          <label className="block text-sm font-medium mb-1">코너</label>
          {loadingCorners ? (
            <div className="text-sm text-gray-500">코너 불러오는 중…</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {corners.map(c => (
                <button
                  key={c.id}
                  className={`text-left p-3 rounded-xl border hover:shadow ${cornerId===c.id?'ring-2 ring-black':''}`}
                  onClick={()=>setCornerId(c.id)} // c.id = slug
                >
                  <div className="font-medium">{c.name || '기타'}</div>
                  <div className="text-sm text-gray-500">KAN {c.categoryCount}</div>
                </button>
              ))}
              {!corners.length && <div className="text-sm text-gray-500">코너 없음</div>}
            </div>
          )}
        </div>

        {/* KAN 리스트 (소분류 라벨) */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              {cornerId ? `선택 코너: ${cornerId.replaceAll('_',' ')}` : '코너를 선택하세요'}
            </h2>
            {cornerId && <div className="text-sm text-gray-500">{kans.length} KAN</div>}
          </div>

          {cornerId && (
            loadingKans ? (
              <div className="text-sm text-gray-500">카테고리 불러오는 중…</div>
            ) : (
              <ul className="divide-y rounded-xl border bg-white">
                {kans.map(k => (
                  <li
                    key={k.id}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => onClickKan(k.id)}
                    title="상품 보기"
                  >
                    <div>
                      <div className="font-medium">{k.name || '기타'}</div>
                      <div className="text-xs text-gray-500">KAN: {k.id}</div>
                    </div>
                    <div className="text-sm text-gray-600">{k.childrenCount}개 상품</div>
                  </li>
                ))}
                {!kans.length && <li className="p-3 text-gray-500">해당 코너의 KAN이 없습니다</li>}
              </ul>
            )
          )}
        </section>


        {/* 상품 그리드 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">상품 목록</h2>
            <div className="text-sm text-gray-500">총 {products.length}개</div>
          </div>

          {loadingProds && (
            <div className="p-6 text-sm text-gray-500 border rounded-xl bg-white">불러오는 중…</div>
          )}
          {!loadingProds && error && (
            <div className="p-6 text-sm text-red-500 border rounded-xl bg-white">{error}</div>
          )}

          {!loadingProds && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p.gtin} className="border rounded-2xl bg-white p-3">
                  <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden grid place-items-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-xs text-gray-400">이미지 없음</div>
                    )}
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="text-sm text-gray-500">{p.gtin}</div>
                    <div className="text-sm font-medium line-clamp-2">{p.name}</div>
                    <div className="text-base font-semibold">
                      {p.price ? Number(p.price).toLocaleString() : "-"}
                      <span className="ml-1 text-sm text-gray-500">{p.unit || ""}</span>
                    </div>
                  </div>
                  <button
                    className={`mt-3 w-full rounded-xl text-sm py-2 ${
                      p.orderable ? "bg-gray-900 text-white hover:opacity-90" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!p.orderable}
                  >
                    담기
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loadingProds && !error && products.length === 0 && (
            <div className="p-6 text-sm text-gray-500 border rounded-xl bg-white">
              선택한 KAN에 상품이 없어요.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}