  // C:\teamYouthCase\OrderFlow-Frontend\src\features\PR\pages\CategoryListDeletePage.jsx

  import ApiClient from "../../../common/authorities/api/ApiClient";
  import { useEffect, useMemo, useState } from "react";
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

    // 대표상품 배치 API
async function fetchProductSamples(kanCodes, limit = 2) {
  if (!Array.isArray(kanCodes) || kanCodes.length === 0) return {};
  const data = await ApiClient.post("/categories/product-samples", {
    kanCodes,
    limit,
  });
  // 기대: { "01020101": ["서울우유 1L", "매일우유 1L"], ... }
  return data ?? {};
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
              <th className="px-4 py-3">상품명(대표)</th>
              <th className="px-4 py-3 text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((c) => (
              <tr key={c.kanCode} className="text-sm">
                <td className="px-4 py-3 font-mono">{c.kanCode}</td>
                <td className="px-4 py-3">{breadcrumb(c)}</td>
                <td className="px-4 py-3">
               {c.sampleProducts?.length
                 ? c.sampleProducts.join(", ")
                 : <span className="text-gray-400">-</span>}
             </td>
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
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const query = useQuery({
      queryKey: ["categories"],
      queryFn: fetchCategories,
      staleTime: 60 * 1000,
    });

 // 1) 검색 적용된 전체 목록
 const filteredAll = useMemo(() => {
   return filterCategories(query.data ?? [], keyword);
 }, [query.data, keyword]);

 // 검색어나 전체목록이 바뀌면 1페이지로
 useEffect(() => { setPage(1); }, [keyword, query.data]);

 // 2) 페이지 계산
 const total = filteredAll.length;
 const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
 const safePage = Math.min(page, totalPages);
 const pagedItems = useMemo(() => {
   const start = (safePage - 1) * PAGE_SIZE;
   return filteredAll.slice(start, start + PAGE_SIZE);
 }, [filteredAll, safePage]);

 // 3) 현재 페이지 KAN들만 대표상품 배치 호출
 const pageKanCodes = useMemo(() => pagedItems.map(c => c.kanCode), [pagedItems]);
 const productSamplesQuery = useQuery({
   queryKey: ["category-product-samples", pageKanCodes],
   enabled: pageKanCodes.length > 0,
   queryFn: () => fetchProductSamples(pageKanCodes, 2),
   staleTime: 60 * 1000,
 });

 // 4) 현재 페이지 항목에 대표상품 합치기
 const withSamples = useMemo(() => {
   const map = productSamplesQuery.data ?? {};
   return pagedItems.map(c => ({
     ...c,
     sampleProducts: Array.isArray(map[c.kanCode]) ? map[c.kanCode] : [],
   }));
 }, [pagedItems, productSamplesQuery.data]);


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
      const status = err?.response?.status;
      let msg;
      if (status === 409) {
        msg = err?.response?.data?.message ?? "상품이 있는 카테고리는 삭제할 수 없습니다.";
      } else if (status === 404) {
        msg = "해당 카테고리를 찾을 수 없습니다.";
      } else if (status === 500) {
        msg = "해당 카테고리에 상품이 있어 삭제가 불가능합니다.";
      } else {
        msg = err?.response?.data?.message ?? "삭제 중 오류가 발생했어요.";
      }
      alert(`${msg}`);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(totalPages, page + 1));

  // 페이지 번호 5개 정도만 보여주는 간단 버전
  const nums = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button onClick={prev} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
              disabled={page === 1}>이전</button>
      {nums.map(n => (
        <button key={n}
          onClick={() => onChange(n)}
          className={`rounded-lg px-3 py-1 text-sm ${n===page ? "bg-gray-800 text-white" : "border"}`}>
          {n}
        </button>
      ))}
      <button onClick={next} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
              disabled={page === totalPages}>다음</button>
    </div>
  );
}


  const askDelete = (category) => setTarget(category);
  const closeModal = () => setTarget(null);
  const confirmDelete = () => {
      if (!target) return;
      delMut.mutate(target.kanCode);
      setTarget(null);
  };


  return (
    <div className="relative z-0 mx-auto max-w-6xl p-6">
        <header className="mb-6 relative z-0">
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
          <>
          <CategoryTable items={withSamples} onAskDelete={askDelete} deleting={delMut.isPending} />
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </>

      
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