import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { 
    fetchStockStatusList 
} from '../api/stockApi'; 


import InventoryListComponent from './InventoryListComponent'; 

const StockStatus = () => {
    // 상태 관리
    const [stockData, setStockData] = useState([]);
    // capacityStatus, relocationData는 미사용이므로 제거
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 재고 목록을 불러오는 함수 (전체 재고 현황 테이블)
    const loadStockData = async () => {
        try {
            const rawData = await fetchStockStatusList(); 
            const arrayData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
            
            const mappedData = arrayData.map(item => {
            // console.log("API 응답 Raw Data:", item); // 디버깅용 로그는 유지할 수 있습니다.
                return [
                    // ⭐️ 수정: 디버깅용 주석 문자열 전부 제거
                    item.name,        // 제품명 (StockResponse DTO의 name 필드 사용)
                    item.warehouseId, // 보관 위치 (StockResponse DTO의 warehouseId 필드 사용)
                    // 수량 포맷팅 유지
                    item.quantity ? item.quantity.toLocaleString() + ' EA' : '0 EA' 
                ];
            });

            console.log("InventoryListComponent에 전달될 Mapped Data:", mappedData);
            setStockData(mappedData);

        } catch (err){
            console.error("전체 재고 현황 목록을 불러오는 데 실패했습니다.", err);
            setError("전체 재고 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            // 데이터 로드 성공/실패와 관계없이 로딩 상태 해제는 여기서 하는 것이 좋습니다.
            setIsLoading(false); 
        }
    };
    
    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadStockData();
        // loadCapacityStatus, loadRelocationData 호출은 제거됨
    }, []);

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div>오류: {error}</div>;

    // 랜더링 로직
    return (
        <div className="stock-status-page">
            <h2>📊 현재 재고 현황 조회</h2>
                                 
            <InventoryListComponent 
                title="전체 재고 현황 (품목별)"
                headers={['제품명', '보관 위치', '현재 수량']}
                data={stockData}
            />
        </div>
    );
};

// ⭐️ 미사용 컴포넌트의 PropTypes는 제거되었습니다.
// InventoryListComponent의 PropTypes만 남깁니다.
InventoryListComponent.propTypes = {
    title: PropTypes.string.isRequired,
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))).isRequired,
};

export default StockStatus;