import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import storeApi from "../api/storeApi.js";
import { useToast } from "/src/components/providers/ToastProvider";
import MiniLoader from "/src/components/loading/MiniLoader";

const WarehouseManageTab = ({ storeId, mode }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    ambientCapacity: "",
    chilledCapacity: "",
    frozenCapacity: "",
  });

  // ✅ 기존 데이터 불러오기
  const { data: store, isLoading } = useQuery({
    queryKey: ["storeCapacity", storeId],
    queryFn: async () => {
      const res = await storeApi.getById(storeId);
      console.log(res);
      return res.data;
    },
    enabled: !!storeId,
  });

  useEffect(() => {
    if (store) {
      setForm({
        ambientCapacity: store.ambientCapacity || "",
        chilledCapacity: store.chilledCapacity || "",
        frozenCapacity: store.frozenCapacity || "",
      });
    }
  }, [store]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (mode === "user") return; // 사용자 모드는 읽기 전용
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 저장 처리
  const updateCapacity = useMutation({
    mutationFn: async (data) => await storeApi.updateCapacity(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["storeCapacity", storeId]);
      showToast("창고 용량이 저장되었습니다 ✅", "success");
    },
    onError: () => {
      showToast("저장 중 오류가 발생했습니다 ❌", "error");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCapacity.mutate(form);
  };

  // ✅ 내부 로딩 표시
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <MiniLoader message="창고 용량 정보를 불러오는 중입니다..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold mb-3">🏪 창고 용량 설정</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        {["ambientCapacity", "chilledCapacity", "frozenCapacity"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field === "ambientCapacity" && "실온 창고 용량 (CBM)"}
              {field === "chilledCapacity" && "냉장 창고 용량 (CBM)"}
              {field === "frozenCapacity" && "냉동 창고 용량 (CBM)"}
            </label>
            <input
              type="number"
              name={field}
              value={form[field]}
              onChange={handleChange}
              readOnly={mode === "user"}
              className={`w-full border rounded-md px-3 py-2 ${
                mode === "user"
                  ? "bg-gray-100 text-gray-500"
                  : "focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
          </div>
        ))}

        {mode === "admin" && (
          <button
            type="submit"
            className={`w-full py-2 rounded-md text-sm font-medium text-white ${
              updateCapacity.isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {updateCapacity.isPending ? "저장 중..." : "저장하기"}
          </button>
        )}
      </form>
    </div>
  );
};

export default WarehouseManageTab;
