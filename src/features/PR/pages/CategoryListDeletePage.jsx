// C:\teamYouthCase\OrderFlow-Frontend\src\features\PR\pages\CategoryListDeletePage.jsx

import ApiClient from "../../../common/authorities/api/ApiClient";
import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, RefreshCw ,Search } from "lucide-react";
import { filterCategories } from "../util/filterCategories";

/** ----------------------------- API LAYER ------------------------------ **/

async function fetchCategories() {
    const  data  = await ApiClient.get("/categories");
    const pickArray = (x) => {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    const cands = [x.content, x.items, x.list, x.results, x.data, x.data?.content, x.data?.items];
    const arr = cands.find(Array.isArray);
    if (Array.isArray(arr)) return arr;
    return typeof x === "object" ? Object.values(x) : [];
  };

  

  const raw = pickArray(data);
  console.debug("raw length ▶", raw.length, "sample keys ▶", Object.keys(raw?.[0] ?? {}));


 const normalize = (c = {}) => ({
   kanCode: c.kanCode,
   name: c.name ?? c.smallCategory ?? c.mediumCategory ?? c.largeCategory ?? c.totalCategory ?? "(이름 없음)",
   parentKanCode: c.parent?.kanCode ?? null, // ← parent는 객체
   largeCategory: c.largeCategory ?? null,
   mediumCategory: c.mediumCategory ?? null,
   smallCategory: c.smallCategory ?? null
 });
 const list = raw.map(normalize).filter(x => !!x.kanCode);
  console.debug("normalized length ▶", list.length);
  return list;
}

// 카테고리 삭제
  async function deleteCategory(kanCode) {
    if (!kanCode) throw new Error("Kan 코드가 비었습니다.");
    await ApiClient.delete(`/categories/${encodeURIComponent(kanCode)}`)
    
  }


/** ------------------------------ PURE UTILS --------------------------- **/
/**
* @param {Array} list
* @param {string} keyword
*/

// --- 유틸 추가 ---
const displayCategoryName = (c) =>
  c?.name ??
  c?.categoryName ??
  c?.smallCategory ??
  c?.mediumCategory ??
  c?.largeCategory ??
  c?.totalCategory ??
  "(이름 없음)";

const breadcrumb = (c) => {
  const parts = [c?.largeCategory, c?.mediumCategory, c?.smallCategory].filter(Boolean);
  return parts.length ? parts.join(" > ") : displayCategoryName(c);
};



/** ------------------------------ UI PARTS ----------------------------- **/
function ConfirmModal({ open, title = "삭제 확인", description, confirmText = "삭제", onConfirm, onClose, loading }) {
if (!open) return null;
return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
<h3 className="text-lg font-semibold">{title}</h3>
{description && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{description}</p>}
<div className="mt-6 flex justify-end gap-2">
<button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm">취소</button>
<button
onClick={onConfirm}
disabled={loading}
className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
>
{loading ? "삭제 중…" : confirmText}
</button>
</div>
</div>
</div>
);
}


function Toolbar({ keyword, setKeyword, onRefresh, refreshing }) {
return (
<div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
<div className="flex w-full max-w-sm items-center rounded-xl border px-3 py-2">
<Search className="mr-2 h-4 w-4 text-gray-500" />
<input
value={keyword}
onChange={(e) => setKeyword(e.target.value)}
placeholder="KAN 코드 또는 명칭 검색"
className="w-full outline-none"
/>
</div>
<button
onClick={onRefresh}
disabled={refreshing}
className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
>
<RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> 새로고침
</button>
</div>
);
}

// --- 테이블의 이름 컬럼 교체 & 삭제 버튼 잠금 ---
function CategoryTable({ items, onAskDelete, deleting }) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr className="text-sm text-gray-600">
            <th className="px-4 py-3">KAN 코드</th>
            <th className="px-4 py-3">카테고리 명</th>
            <th className="px-4 py-3">레벨</th>
            <th className="px-4 py-3">상위 KAN</th>
            <th className="px-4 py-3 text-right">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((c) => (
            <tr key={c.kanCode} className="text-sm">
              <td className="px-4 py-3 font-mono">{c.kanCode}</td>
              <td className="px-4 py-3">{breadcrumb(c)}</td>
              <td className="px-4 py-3">{c.level ?? c.depth ?? "-"}</td>
              <td className="px-4 py-3 font-mono">{c.parentKanCode ?? "-"}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => onAskDelete(c)}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" /> 삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="p-8 text-center text-sm text-gray-500">검색 결과가 없습니다.</div>
      )}
    </div>
  );
}


/** ------------------------------ PAGE (Default Wrapped) -------------- **/
const __sharedQueryClient = new QueryClient();
export default function CategoryListDeletePage() {
return (
<QueryClientProvider client={__sharedQueryClient}>
<CategoryListDeletePageInner />
</QueryClientProvider>
);
}
/** ------------------------------ PAGE (Inner) ------------------------- **/


export function CategoryListDeletePageInner() {
  const qc = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [target, setTarget] = useState(null);

  const query = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60 * 1000,
  });

  const filtered = useMemo(
    () => filterCategories(query.data ?? [], keyword),
    [query.data, keyword]
  );

const delMut = useMutation({
  mutationFn: async (kanCode) => deleteCategory(kanCode),
  onMutate: async (kanCode) => {
    await qc.cancelQueries({ queryKey: ["categories"] });
    const prev = qc.getQueryData(["categories"]);
    qc.setQueryData(["categories"], (old = []) => old.filter((c) => c.kanCode !== kanCode));
    return { prev };
  },
  onError: (err, _kanCode, ctx) => {
    if (ctx?.prev) qc.setQueryData(["categories"], ctx.prev);
    console.error(err);
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "삭제 중 오류가 발생했어요. (관계 제약 또는 서버 오류)";
    alert(msg);
  },
  onSettled: () => {
    qc.invalidateQueries({ queryKey: ["categories"] });
  },
});


const askDelete = (category) => setTarget(category);
const closeModal = () => setTarget(null);
const confirmDelete = () => {
    if (!target) return;
    delMut.mutate(target.kanCode);
    setTarget(null);
};


return (
  <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">카테고리 관리</h1>
        <p className="mt-1 text-sm text-gray-600">
          불필요한 카테고리를 검색 후 선택하여 삭제할 수 있어요.
        </p>
      </header>


    <Toolbar
    keyword={keyword}
    setKeyword={setKeyword}
    onRefresh={() => query.refetch()}
    refreshing={query.isFetching}
    />


{query.isLoading ? (
        <div className="rounded-2xl border p-8 text-center text-sm text-gray-500">
          불러오는 중…
        </div>
      ) : query.isError ? (
        <div className="rounded-2xl border p-8 text-center text-sm text-red-600">
          목록을 가져오지 못했어요.
        </div>
      ) : (
        <CategoryTable items={filtered} onAskDelete={askDelete} deleting={delMut.isPending} />
      )}


<ConfirmModal
open={!!target}
title="카테고리 삭제"
description={
target
? `정말로 삭제할까요? 이 작업은 되돌릴 수 없어요.\nKAN=${target.kanCode} / 이름=${target.name ?? target.categoryName ?? "(이름 없음)"}`
: undefined
}
confirmText="영구 삭제"
onConfirm={confirmDelete}
onClose={closeModal}
loading={delMut.isPending}
/>
</div>
);
};