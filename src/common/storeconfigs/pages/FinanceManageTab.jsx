import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import storeApi from "../api/storeApi.js";
import { useToast } from "/src/components/providers/ToastProvider";

const FinanceManageTab = ({ storeId, mode }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    monthlyBudget: "",
    rentCost: "",
    laborCost: "",
    otherCost: "",
  });

  // ✅ 데이터 로드
  const { data: store, isLoading } = useQuery({
    queryKey: ["storeFinance", storeId],
    queryFn: () => storeApi.getById(storeId).then((res) => res.data),
    enabled: !!storeId,
  });

  useEffect(() => {
    if (store) {
      setForm({
        monthlyBudget: store.monthlyBudget || "",
        rentCost: store.rentCost || "",
        laborCost: store.laborCost || "",
        otherCost: store.otherCost || "",
      });
    }
  }, [store]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (mode === "user") return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 저장 처리
  const updateFinance = useMutation({
    mutationFn: (data) => storeApi.updateFinance(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["storeFinance", storeId]);
      showToast("예산 및 고정비 정보가 저장되었습니다.", "success");
    },
    onError: () => {
      showToast("저장 중 오류가 발생했습니다.", "error");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFinance.mutate(form);
  };

  if (isLoading) return <p>로딩 중...</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold mb-3">💰 예산 및 고정비 설정</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        {[
          { name: "monthlyBudget", label: "월 예산 (₩)" },
          { name: "rentCost", label: "임대료 (₩)" },
          { name: "laborCost", label: "인건비 (₩)" },
          { name: "otherCost", label: "기타 고정비 (₩)" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type="number"
              name={field.name}
              value={form[field.name]}
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

export default FinanceManageTab;
