import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { userStoreApi } from "../../../../common/api/storeApi";
import { useAuth } from "../../../../common/context/AuthContext";

export default function StoreUpdateTab() {
    const { user } = useAuth();

    // ✅ user가 아직 로드되지 않았다면 null 보호
    if (!user) {
        return <p className="text-sm text-gray-500">사용자 정보를 불러오는 중입니다...</p>;
    }

    // ✅ storeId도 없을 경우 방어
    if (!user.storeId) {
        return <p className="text-sm text-gray-500">지점 정보가 연결되지 않았습니다.</p>;
    }

    // ✅ 지점 정보 불러오기
    const { data: storeInfo, isLoading } = useQuery({
        queryKey: ["store", user.storeId],
        queryFn: () => userStoreApi.getStoreById(user.storeId).then((res) => res.data),
        enabled: !!user?.storeId,
    });

    const [form, setForm] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ 수정 API
    const updateStore = useMutation({
        mutationFn: (data) => userStoreApi.updateStore(user.storeId, data),
    });

    const handleSave = () => updateStore.mutate(form);

    if (isLoading) return <p className="text-sm text-gray-500">불러오는 중...</p>;

    return (
        <div className="space-y-4">
            <h3 className="text-base font-semibold">🏪 지점 정보 수정</h3>

            <div className="space-y-2">
                <label className="block text-xs text-gray-500">지점명</label>
                <input
                    name="name"
                    value={form.name || storeInfo?.name || ""}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-xs text-gray-500">주소</label>
                <input
                    name="address"
                    value={form.address || storeInfo?.address || ""}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                />
            </div>

            <button
                onClick={handleSave}
                disabled={updateStore.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium mt-3"
            >
                {updateStore.isPending ? "저장 중..." : "변경사항 저장"}
            </button>
        </div>
    );
}
