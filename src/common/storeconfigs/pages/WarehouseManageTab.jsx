import { useQuery } from "@tanstack/react-query";
import warehouseApi from "../api/warehouseApi";
import MiniLoader from "/src/components/loading/MiniLoader";

const WarehouseManageTab = ({ storeId }) => {
  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ["storeWarehouses", storeId],
    queryFn: () => warehouseApi.getWarehousesByStore(storeId),
    enabled: !!storeId,
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <MiniLoader message="창고 정보를 불러오는 중..." />
      </div>
    );

  // ✅ 예시: 전체 용량 합산 (storeCapacity)
  const totalMaxCapacity = warehouses.reduce(
    (sum, w) => sum + (w.maxCapacity ?? 0),
    0
  );
  const totalCurrentCapacity = warehouses.reduce(
    (sum, w) => sum + (w.currentCapacity ?? 0),
    0
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        총 용량: {totalCurrentCapacity} / {totalMaxCapacity} m³
      </h2>

      {warehouses.map((w) => {
        const percent = ((w.currentCapacity / w.maxCapacity) * 100).toFixed(1);
        return (
          <div key={w.warehouseId} className="p-3 border rounded-lg shadow-sm space-y-1">
            <div className="flex justify-between">
              <p className="font-semibold">{w.warehouseName}</p>
              <p className="text-sm text-gray-600">{percent}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {w.currentCapacity} / {w.maxCapacity} m³ · 보관방식: {w.storageMethod}
            </p>
          </div>
        );
      })}

    </div>
  );
};

export default WarehouseManageTab;
