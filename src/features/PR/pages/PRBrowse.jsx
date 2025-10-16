import React, {useEffect, useMemo, useState} from "react";
import { Sun, Refrigerator, Snowflake, PackageOpen } from "lucide-react";
import { fetchCorners, fetchCategories } from "../api/browse";

const ZONES = [
  { key: "room",    label: "실온", icon: <Sun className="h-5 w-5" /> },
  { key: "chilled", label: "냉장", icon: <Refrigerator className="h-5 w-5" /> },
  { key: "frozen",  label: "냉동", icon: <Snowflake className="h-5 w-5" /> },
  { key: "other",   label: "기타", icon: <PackageOpen className="h-5 w-5" /> },
];

export default function PRBrowse() {
  const [zone, setZone] = useState("room");     // 내부값은 영문 키 권장
  const [corners, setCorners] = useState([]);   // [{id,name,categoryCount}]
  const [cornerId, setCornerId] = useState(null);
  const [kans, setKans] = useState([]);         // [{id,name,childrenCount}]
  const [loadingCorners, setLoadingCorners] = useState(false);
  const [loadingKans, setLoadingKans] = useState(false);

  // 존 변경 → 코너 로드
  useEffect(() => {
    setLoadingCorners(true);
    setCornerId(null);
    setKans([]);
    fetchCorners(zone).then(setCorners).finally(() => setLoadingCorners(false));
  }, [zone]);

  // 코너 선택 → KAN 로드
  useEffect(() => {
    if (!cornerId) return;
    setLoadingKans(true);
    fetchCategories(zone, cornerId).then(setKans).finally(() => setLoadingKans(false));
  }, [zone, cornerId]);

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
              >
                {z.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6 space-y-6">
        {/* 코너 선택기 (한 개만) */}
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
                  onClick={()=>setCornerId(c.id)}
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
                  <li key={k.id} className="p-3 flex items-center justify-between">
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

        {/* 상품 그리드는 나중에 KAN 클릭 → 상품 API 붙일 때 렌더 */}
      </main>
    </div>
  );
}