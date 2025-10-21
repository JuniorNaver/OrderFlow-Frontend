import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import storeApi from "../../../api/storeApi";
import Toast from "../../../../components/Toast";

const StoreCapacityTab = ({ storeId, mode }) => {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    ambientCapacity: "",
    chilledCapacity: "",
    frozenCapacity: "",
  });

  // ✅ 기존 데이터 불러오기
  const { data: store, isLoading } = useQuery({
    queryKey: ["storeCapacity", storeId],
    queryFn: () => storeApi.getById(storeId).then((res) => res.data),
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
    mutationFn: (data) => storeApi.updateCapacity(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["storeCapacity", storeId]);
      setToast({ type: "success", message: "창고 용량이 저장되었습니다." });
    },
    onError: () => {
      setToast({ type: "error", message: "저장 중 오류가 발생했습니다." });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCapacity.mutate(form);
  };

  if (isLoading) return <p>로딩 중...</p>;

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
                mode === "user" ? "bg-gray-100 text-gray-500" : "focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
          </div>
        ))}

        {mode === "admin" && (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            저장하기
          </button>
        )}
      </form>

      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
};

export default StoreCapacityTab;
