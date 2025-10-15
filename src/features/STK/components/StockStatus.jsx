import React, { useState, useEffect } from 'react'; // 👈 useState, useEffect 추가
import InventoryListComponent from './InventoryListComponent';
import { fetchStockStatusList } from '../api/stockApi'; // 👈 API import

const StockStatus = () => {
    const [stockData, setStockData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchStockStatusList(); // API 호출
                setStockData(data);
            } catch (error) {
                console.error("전체 재고 현황 목록을 불러오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);
    
    if (isLoading) {
        // 로딩 중일 때 빈 목록 컴포넌트에 빈 배열 전달
        return <InventoryListComponent 
                    title="전체 재고 현황 (품목별)" 
                    data={[]} 
                    headers={['제품명', '보관 위치', '현재 수량']}
                />;
    }

    return (
        <InventoryListComponent 
            title="전체 재고 현황 (품목별)" 
            data={stockData} // 👈 상태 데이터 사용
            headers={['제품명', '보관 위치', '현재 수량']}
        />
    );
};

export default StockStatus;