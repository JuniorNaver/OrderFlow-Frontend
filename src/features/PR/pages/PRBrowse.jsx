import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getCategories, getCorners } from "../api/browse";
import { useMemo } from "react";
import { Home, PackageOpen, Refrigerator, Snowflake, Sun, ChevronLeft } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../../../common/components/common/Card";
import { Badge } from "../../../common/components/common/Badge";
import { Skeleton } from "../../../common/components/common/Skeleton";
const ZONES = [
  { key: "room",    label: "실온", icon: <Sun className="h-5 w-5" /> },
  { key: "chilled", label: "냉장", icon: <Refrigerator className="h-5 w-5" /> },
  { key: "frozen",  label: "냉동", icon: <Snowflake className="h-5 w-5" /> },
  { key: "other",   label: "기타", icon: <PackageOpen className="h-5 w-5" /> },
];

export default function PRBrowse() {
  const nav = useNavigate();
  const { zone: zoneParam, cornerId } = useParams();

  const zone = zoneParam ?? "room";
  const mode = cornerId ? "category" : "corner";

  const {
    data: corners,
    isLoading: cornersLoading,
    error: cornersError,
  } = useQuery({
    queryKey: ["pr-corners", zone],
    queryFn: () => getCorners(zone),
    enabled: mode === "corner",
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["pr-categories", zone, cornerId],
    queryFn: () => getCategories(zone, cornerId),
    enabled: mode === "category",
  });

  const title = useMemo(() => {
    const m = ZONES.find(z => z.key === zone);
    return m ? m.label : "실온";
  }, [zone]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <h1 className="text-xl font-bold">발주 카테고리</h1>
            <span className="text-slate-400">/</span>
            <span className="text-slate-700">{title}</span>
            {mode === "category" && (
              <>
                <span className="text-slate-400">/</span>
                <span className="text-slate-700">코너</span>
              </>
            )}
          </div>

          {/* 존 선택 탭 */}
          <div className="flex gap-2">
            {ZONES.map(z => (
              <button
                key={z.key}
                onClick={() => nav(`/pr/browse/${z.key}`)}
                className={`px-3 py-1 rounded-full text-sm border flex items-center gap-1
                  ${z.key === zone ? "bg-black text-white" : "bg-white hover:bg-slate-50"}`}
              >
                {z.icon}
                {z.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* 뒤로가기 (카테고리 화면일 때) */}
        {mode === "category" && (
          <button
            onClick={() => nav(`/pr/browse/${zone}`)}
            className="mb-4 inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" /> 코너로 돌아가기
          </button>
        )}

        {/* 코너 목록 */}
        {mode === "corner" && (
          <>
            {cornersLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            )}
            {cornersError && (
              <div className="text-red-500">코너를 불러오지 못했어요.</div>
            )}
            {corners && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {corners.map(c => (
                  <Card
                    key={c.id}
                    onClick={() => nav(`/pr/browse/${zone}/${c.id}`)}
                    className="cursor-pointer hover:shadow-md transition"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold">{c.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 flex items-center justify-between">
                      <span>{c.desc || ""}</span>
                      <Badge variant="secondary">KAN {c.categoryCount}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* 카테고리(KAN) 목록 */}
        {mode === "category" && (
          <>
            {categoriesLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            )}
            {categoriesError && (
              <div className="text-red-500">카테고리를 불러오지 못했어요.</div>
            )}
            {categories && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <Link key={c.id} to={`/pr/list?kan=${c.id}`} className="block">
                    <Card className="hover:shadow-md transition">
                      <CardHeader className="pb-2 flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">{c.name}</CardTitle>
                        <Badge variant="secondary">{c.id}</Badge>
                      </CardHeader>
                      <CardContent className="text-sm text-slate-600">
                        상품 {c.childrenCount}개
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}