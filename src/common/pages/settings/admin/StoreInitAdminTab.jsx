import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storeAdminApi } from "../../../../api/storeAdminApi";

export default function StoreInitAdminTab() {
  const queryClient = useQueryClient();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: storeAdminApi.getAllStores,
  });

  const [form, setForm] = useState({
    name: "",
    regionCode: "",
    brandCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createStore = useMutation({
    mutationFn: storeAdminApi.createStore,
    onSuccess: () => queryClient.invalidateQueries(["stores"]),
  });

  if (isLoading) return <p className="text-sm text-gray-500">불러오는 중...</p>;

  if (stores && stores.length > 0) {
    return (
      <div className="text-sm text-gray-500">
        이미 등록된 지점이 존재합니다. <br />
        수정은 ‘지점 정보 관리’ 탭에서 진행하세요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">🏪 최초 지점 등록</h3>

      <div className="space-y-2 border-t pt-3">
        <input
          type="text"
          name="name"
          placeholder="지점명"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="regionCode"
          placeholder="지역 코드"
          value={form.regionCode}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="brandCode"
          placeholder="브랜드 코드"
          value={form.brandCode}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />

        <button
          onClick={() => createStore.mutate(form)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium"
        >
          {createStore.isPending ? "등록 중..." : "등록하기"}
        </button>
      </div>
    </div>
  );
}
