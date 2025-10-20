import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { 
    fetchStockStatusList 
} from '../api/stockApi'; 

import InventoryListComponent from './InventoryListComponent'; 

const StockStatus = () => {
    // 상태 관리
    const [stockData, setStockData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 재고 목록을 불러오는 함수 (전체 재고 현황 테이블)
    const loadStockData = async () => {
        try {
            const rawData = await fetchStockStatusList(); 
            const arrayData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
            
            // ⭐️ 핵심 수정: 데이터를 DTO 객체 형태(Key-Value)로 매핑합니다.
            // (이전: 배열의 배열 -> 수정 후: 객체의 배열)
            const mappedData = arrayData.map(item => {
                return {
                    // InventoryListComponent에서 사용할 필드 이름으로 매핑
                    name: item.name,           // 제품명
                    warehouseId: item.warehouseId, // 보관 위치
                    quantity: item.quantity ? item.quantity.toLocaleString() + ' EA' : '0 EA' 
                    // StockStatus에서 필요한 다른 필드(gtin, expDate 등)가 있다면 추가합니다.
                };
            });

            console.log("InventoryListComponent에 전달될 Mapped Data:", mappedData);
            setStockData(mappedData);

        } catch (err){
            console.error("전체 재고 현황 목록을 불러오는 데 실패했습니다.", err);
            setError("전체 재고 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false); 
        }
    };
    
    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadStockData();
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
                // ⭐️ StockStatus의 InventoryListComponent에 맞는 매핑 함수를 별도로 전달해야 합니다.
                // 혹은 InventoryListComponent 내부에 StockStatus용 매핑 로직을 추가해야 합니다.
                dataMapper={(item, header) => {
                    switch(header) {
                        case '제품명': return item.name;
                        case '보관 위치': return item.warehouseId;
                        case '현재 수량': return item.quantity;
                        default: return '';
                    }
                }}
            />
        </div>
    );
};

// ⭐️ PropTypes 수정: data가 객체의 배열임을 반영합니다.
InventoryListComponent.propTypes = {
    title: PropTypes.string.isRequired,
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired, // ⭐️ 배열의 배열 -> 객체의 배열로 수정
    dataMapper: PropTypes.func.isRequired, // ⭐️ 새로운 prop 추가
};

export default StockStatus;