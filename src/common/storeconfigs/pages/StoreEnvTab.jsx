import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Save, X } from "lucide-react";
import storeApi from "../api/storeApi";
import { useToast } from "/src/components/providers/ToastProvider";
import MiniLoader from "/src/components/loading/MiniLoader";
import StatusBadge from "/src/common/storeconfigs/components/StatusBadge";
import Button from "../components/Button";

const StoreEnvTab = ({ storeId }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);

  // ✅ 점포 운영환경 조회
  const { data: store, isLoading } = useQuery({
    queryKey: ["store-env", storeId],
    queryFn: async () => await storeApi.getEnv(storeId),
    enabled: !!storeId,
  });

  // ✅ 운영환경 수정
  const updateStore = useMutation({
    mutationFn: async (dto) => await storeApi.updateEnv(storeId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries(["store-env", storeId]);
      showToast("운영환경이 저장되었습니다", "success");
      setEditMode(false);
    },
    onError: () => {
      showToast("저장 중 오류가 발생했습니다 ❌", "error");
    },
  });

  // ✅ 폼 초기화
  useEffect(() => {
    if (store) setForm(store);
  }, [store]);

  // ✅ 입력 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 공백 → null 처리
  const sanitizeForUpdate = (payload) => {
    const toNull = (v) => (v === "" ? null : v);
    return {
      ...payload,
      ownerName: toNull(payload.ownerName),
      bizHours: toNull(payload.bizHours),
      contactNumber: toNull(payload.contactNumber),
      address: toNull(payload.address),
      addressDetail: toNull(payload.addressDetail),
      postCode: toNull(payload.postCode),
      active: payload.active ?? true,
    };
  };

  // ✅ 운영 상태 토글
  const handleToggleActive = () => {
    const updated = { ...store, active: !store.active };
    updateStore.mutate(sanitizeForUpdate(updated));
  };

  // ✅ 내부 로딩 처리
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <MiniLoader message="점포 운영환경 정보를 불러오는 중입니다..." />
      </div>
    );
  }

  if (!store) {
    return (
      <p className="text-sm text-gray-500">점포 설정 정보가 없습니다.</p>
    );
  }

  // ✅ 날짜 포맷
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return isNaN(date) ? "-" : date.toLocaleDateString("ko-KR");
  };

  return (
    <div className="space-y-4 relative">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Building2 className="text-blue-600 w-5 h-5" />
          점포 운영환경 설정
        </h3>

        <StatusBadge
          active={store.active}
          isLoading={updateStore.isPending}
          onToggle={handleToggleActive}
        />
      </div>

      {/* 보기 모드 */}
      {!editMode ? (
        <div className="text-sm text-gray-700 border-t pt-3 space-y-2">
          <p><strong>지점명:</strong> {store.storeName}</p>
          <p><strong>브랜드:</strong> {store.brandCode}</p>
          <p><strong>유형:</strong> {store.storeType}</p>
          <p><strong>지역 코드:</strong> {store.regionCode}</p>
          <p><strong>개점일:</strong> {formatDate(store.openDate)}</p>

          <hr className="my-2" />

          <p><strong>점장명:</strong> {store.ownerName || "-"}</p>
          <p><strong>영업시간:</strong> {store.bizHours || "-"}</p>
          <p><strong>연락처:</strong> {store.contactNumber || "-"}</p>
          <p><strong>주소:</strong> {store.address || "-"}</p>
          <p><strong>상세 주소:</strong> {store.addressDetail || "-"}</p>
          <p><strong>우편번호:</strong> {store.postCode || "-"}</p>

          <button
            onClick={() => setEditMode(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm mt-3 transition"
          >
            수정하기
          </button>
        </div>
      ) : (
        <div className="border-t pt-3 space-y-2">
          {[
            { name: "ownerName", label: "점장명" },
            { name: "bizHours", label: "영업시간 (예: 08:00 ~ 23:00)" },
            { name: "contactNumber", label: "연락처 (예: 010-1234-5678)" },
            { name: "address", label: "주소" },
            { name: "addressDetail", label: "상세 주소" },
            { name: "postCode", label: "우편번호" },
          ].map(({ name, label }) => (
            <input
              key={name}
              name={name}
              placeholder={label}
              value={form?.[name] ?? ""}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          ))}

          <div className="flex gap-2 mt-3">
            <Button
              color="green"
              icon={<Save />}
              disabled={updateStore.isPending}
              onClick={() => updateStore.mutate(sanitizeForUpdate(form))}
            >
              {updateStore.isPending ? "저장 중..." : "저장"}
            </Button>

            <Button color="gray" icon={<X />} onClick={() => setEditMode(false)}>
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};


export default StoreEnvTab;
