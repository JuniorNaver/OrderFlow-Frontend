import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import storeApi from "../api/storeApi";
import { Building2, Power, PowerOff, Edit, Save, X, Trash2 } from "lucide-react";
import { useToast } from "/src/components/providers/ToastProvider";
import StatusBadge from "/src/common/storeconfigs/components/StatusBadge";

const StoreAdminTab = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast(); // ✅ 전역 토스트 호출용

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);

  // ✅ 지점 목록 조회
  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: storeApi.getAll,
  });

  const hasStore = stores && stores.length > 0;
  const store = hasStore ? stores[0] : null;

  // ✅ form 초기화
  useEffect(() => {
    if (store) setForm(store);
  }, [store]);

  // ✅ 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 등록
  const createStore = useMutation({
    mutationFn: storeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
      showToast("지점이 등록되었습니다 ✅", "success");
    },
    onError: () => {
      showToast("지점 등록 중 오류가 발생했습니다 ❌", "error");
    },
  });

  // ✅ 수정
  const updateStore = useMutation({
    mutationFn: ({ storeId, data }) => storeApi.update(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
      showToast("저장되었습니다 ✅", "success");
      setEditMode(false);
    },
    onError: () => {
      showToast("저장 중 오류가 발생했습니다 ❌", "error");
    },
  });

  // ✅ 삭제
  const deleteStore = useMutation({
    mutationFn: storeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
      showToast("삭제되었습니다 🗑️", "success");
    },
    onError: () => {
      showToast("삭제 중 오류가 발생했습니다 ❌", "error");
    },
  });

  // ✅ 운영 상태 토글(운영환경 수정)
  const handleToggleActive = () => {
    const updated = { ...store, active: !store.active };
    updateStore.mutate({ storeId: store.storeId, data: updated });
  };

  // ✅ 날짜 포맷
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date) ? "" : date.toLocaleDateString("ko-KR");
  };

  // ✅ 공백 → null 처리
  const sanitizeForUpdate = (payload) => {
    const toNull = (v) => (v === "" ? null : v);
    return {
      ...payload,
      openDate: toNull(payload.openDate),
      managerId: toNull(payload.managerId),
      addressDetail: toNull(payload.addressDetail),
      postCode: toNull(payload.postCode),
      ownerName: toNull(payload.ownerName),
      bizHours: toNull(payload.bizHours),
      contactNumber: toNull(payload.contactNumber),
      storeType:
        payload.storeType === "DIRECT" || payload.storeType === "FRANCHISE"
          ? payload.storeType
          : null,
    };
  };

  if (isLoading) return <p className="text-sm text-gray-500">불러오는 중...</p>;

  // ────────────────────────────────
  // 🏗 신규 등록 모드
  // ────────────────────────────────
  if (!hasStore) {
    return (
      <div className="space-y-4 relative">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Building2 className="text-blue-600 w-5 h-5" />
          최초 지점 등록
        </h3>

        <div className="space-y-2 border-t pt-3">
          {[
            { name: "storeId", label: "지점 ID" },
            { name: "storeName", label: "지점명" },
            { name: "brandCode", label: "브랜드 코드" },
            { name: "regionCode", label: "지역 코드" },
            { name: "storeType", label: "지점 유형 (DIRECT/FRANCHISE)" },
            { name: "openDate", label: "개점일", type: "date" },
            { name: "managerId", label: "관리자 ID" },
            { name: "address", label: "주소" },
            { name: "addressDetail", label: "상세 주소" },
            { name: "postCode", label: "우편번호" },
          ].map(({ name, label, type }) => (
            <input
              key={name}
              name={name}
              type={type || "text"}
              placeholder={label}
              value={form?.[name] || ""}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          ))}

          <button
            onClick={() => createStore.mutate(form)}
            disabled={createStore.isPending}
            className={`w-full py-2 rounded-md text-sm font-medium text-white ${createStore.isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {createStore.isPending ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────
  // 🛠 수정 / 상태관리 모드
  // ────────────────────────────────
  return (
    <div className="space-y-4 relative">
      {/* 상단 헤더 (지점명 + 상태 뱃지) */}
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="text-blue-600 w-5 h-5" />
          {store.storeName}
        </h3>
        <StatusBadge
          active={store.active}
          isLoading={updateStore.isPending}
          onToggle={handleToggleActive}
        />
      </div>

      {/* ✅ 보기 모드 */}
      {!editMode ? (
        <div className="text-sm text-gray-700 space-y-2">
          {[
            ["지점명", store.storeName],
            ["브랜드 코드", store.brandCode],
            ["지역 코드", store.regionCode],
            ["지점 유형", store.storeType],
            ["개점일", formatDate(store.openDate)],
            ["관리자 ID", store.managerId],
            ["점장명", store.ownerName],
            ["주소", store.address],
            ["상세 주소", store.addressDetail],
            ["우편번호", store.postCode],
            ["영업시간", store.bizHours],
            ["연락처", store.contactNumber],
          ].map(([label, value]) => (
            <p key={label}>
              <strong>{label}:</strong>{" "}
              {value && value !== "" ? value : <span className="text-gray-400">-</span>}
            </p>
          ))}

          <div className="flex gap-2 mt-3">
            <Button color="blue" icon={<Edit />} onClick={() => setEditMode(true)}>
              수정
            </Button>

            <Button
              color="red"
              icon={<Trash2 />}
              onClick={() =>
                window.confirm("정말 삭제하시겠습니까?") &&
                deleteStore.mutate(store.storeId)
              }
            >
              삭제
            </Button>
          </div>
        </div>
      ) : (
        // ✅ 수정 모드
        <div className="space-y-2">
          {[
            { name: "storeName", label: "지점명" },
            { name: "brandCode", label: "브랜드 코드" },
            { name: "regionCode", label: "지역 코드" },
            { name: "storeType", label: "지점 유형 (DIRECT/FRANCHISE)" },
            { name: "openDate", label: "개점일", type: "date" },
            { name: "managerId", label: "관리자 ID" },
            { name: "address", label: "주소" },
            { name: "addressDetail", label: "상세 주소" },
            { name: "postCode", label: "우편번호" },
            { name: "ownerName", label: "점장명" },
            { name: "bizHours", label: "영업시간" },
            { name: "contactNumber", label: "점포 연락처" },
          ].map(({ name, label, type }) => (
            <input
              key={name}
              name={name}
              type={type || "text"}
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
              onClick={() =>
                updateStore.mutate({
                  storeId: store.storeId,
                  data: sanitizeForUpdate(form),
                })
              }
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

// 🔸 버튼 컴포넌트
const Button = ({ color, icon, children, ...props }) => {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    gray: "bg-gray-300 hover:bg-gray-400 text-gray-700",
  };
  return (
    <button
      {...props}
      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-sm font-medium transition ${colors[color]}`}
    >
      {icon}
      {children}
    </button>
  );
};

export default StoreAdminTab;
