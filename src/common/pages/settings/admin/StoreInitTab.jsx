import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminStoreApi } from "../../../../common/api/storeApi";

export default function StoreInitTab() {
  const queryClient = useQueryClient();

  // ✅ 전체 지점 목록 불러오기
  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: () => adminStoreApi.getAllStores().then((res) => res.data),
  });

  const [newStore, setNewStore] = useState({
    name: "",
    regionCode: "",
    brandCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStore((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 신규 등록
  const createStore = useMutation({
    mutationFn: (data) => adminStoreApi.createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
      setNewStore({ name: "", regionCode: "", brandCode: "" });
    },
  });

  // ✅ 비활성화
  const deactivateStore = useMutation({
    mutationFn: (storeId) => adminStoreApi.deactivateStore(storeId),
    onSuccess: () => queryClient.invalidateQueries(["stores"]),
  });

  const handleRegister = () => createStore.mutate(newStore);

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">🏪 지점 초기 설정</h3>

      <div className="border-t pt-3 mt-4">
        <h4 className="text-sm font-medium mb-2 text-gray-700">새 지점 등록</h4>
        <div className="space-y-2">
          <input
            type="text"
            name="name"
            placeholder="지점명"
            value={newStore.name}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="regionCode"
            placeholder="지역 코드"
            value={newStore.regionCode}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="brandCode"
            placeholder="브랜드 코드"
            value={newStore.brandCode}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={handleRegister}
            disabled={createStore.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium"
          >
            {createStore.isPending ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </div>

      <div className="border-t pt-3 mt-4">
        <h4 className="text-sm font-medium mb-2 text-gray-700">지점 목록</h4>

        {isLoading ? (
          <p className="text-gray-500 text-sm">불러오는 중...</p>
        ) : (
          <ul className="text-sm text-gray-700 space-y-1">
            {stores?.length === 0 ? (
              <li className="text-gray-400 italic">등록된 지점이 없습니다.</li>
            ) : (
              stores.map((store) => (
                <li
                  key={store.storeId}
                  className="flex justify-between items-center border-b py-1"
                >
                  <span>{store.name}</span>
                  <button
                    onClick={() => deactivateStore.mutate(store.storeId)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    비활성화
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
