import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import storeAdminApi from "../../../api/storeAdminApi";


const StoreUpdateAdminTab = () => {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: storeAdminApi.getAllStores,
  });

  const updateStore = useMutation({
    mutationFn: (data) => storeAdminApi.createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
      setEditMode(false);
    },
  });

  const deleteStore = useMutation({
    mutationFn: storeAdminApi.deleteStore,
    onSuccess: () => queryClient.invalidateQueries(["stores"]),
  });

  if (isLoading) return <p className="text-sm text-gray-500">불러오는 중...</p>;
  if (!stores || stores.length === 0)
    return <p className="text-sm text-gray-500">등록된 지점이 없습니다.</p>;

  const store = stores[0];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">🏪 지점 정보 관리</h3>

      {!editMode ? (
        <div className="text-sm text-gray-700 border-t pt-3 space-y-2">
          <p><strong>지점명:</strong> {store.name}</p>
          <p><strong>지역 코드:</strong> {store.regionCode}</p>
          <p><strong>브랜드 코드:</strong> {store.brandCode}</p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                setForm(store);
                setEditMode(true);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm"
            >
              수정
            </button>
            <button
              onClick={() => deleteStore.mutate(store.storeId)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm"
            >
              삭제
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t pt-3 space-y-2">
          <input
            name="name"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <input
            name="regionCode"
            value={form.regionCode || ""}
            onChange={(e) => setForm({ ...form, regionCode: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <input
            name="brandCode"
            value={form.brandCode || ""}
            onChange={(e) => setForm({ ...form, brandCode: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => updateStore.mutate(form)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm"
            >
              저장
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-md text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreUpdateAdminTab;
