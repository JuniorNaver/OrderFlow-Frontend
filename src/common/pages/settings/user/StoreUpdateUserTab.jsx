import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storeConfigApi } from "../../../api/storeConfigApi";

const StoreUpdateUserTab = ({user}) => {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  // ✅ Hook은 무조건 컴포넌트 최상단에서 호출되어야 함
  const storeId = user?.storeId;

  const { data: store, isLoading } = useQuery({
    queryKey: ["store-config", storeId],
    queryFn: () => storeConfigApi.getConfig(storeId),
    enabled: !!storeId, // ✅ user가 없거나 storeId 없으면 자동으로 실행 안 됨
  });

  const updateStore = useMutation({
    mutationFn: (dto) => storeConfigApi.updateConfig(storeId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries(["store-config", storeId]);
      setEditMode(false);
    },
  });

  // ✅ 이제 조건문은 아래쪽에 둬도 안전
  if (!user) return <p className="text-sm text-gray-500">사용자 정보를 불러오는 중...</p>;
  if (!storeId) return <p className="text-sm text-gray-500">지점이 연결되지 않았습니다.</p>;
  if (isLoading) return <p className="text-sm text-gray-500">불러오는 중...</p>;
  if (!store) return <p className="text-sm text-gray-500">점포 설정 정보가 없습니다.</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">🏪 점포 운영환경 설정</h3>

      {!editMode ? (
        <div className="text-sm text-gray-700 border-t pt-3 space-y-2">
          <p><strong>지점명:</strong> {store.storeName}</p>
          <p><strong>영업시간:</strong> {store.openHours || "정보 없음"}</p>
          <p><strong>상태:</strong> {store.isActive ? "운영중" : "비활성"}</p>

          <button
            onClick={() => {
              setForm(store);
              setEditMode(true);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm mt-2"
          >
            수정하기
          </button>
        </div>
      ) : (
        <div className="border-t pt-3 space-y-2">
          <input
            name="storeName"
            value={form.storeName || ""}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <input
            name="openHours"
            value={form.openHours || ""}
            onChange={(e) => setForm({ ...form, openHours: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <select
            name="isActive"
            value={form.isActive ? "true" : "false"}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isActive: e.target.value === "true" }))
            }
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="true">활성</option>
            <option value="false">비활성</option>
          </select>

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

export default StoreUpdateUserTab;
