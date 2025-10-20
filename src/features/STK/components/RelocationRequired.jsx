// RelocationRequired.jsx (수정된 최종 코드)

import React, { useState, useEffect } from 'react';
import InventoryListComponent from './InventoryListComponent';
import { fetchRelocationList } from '../api/stockApi';

// currentWarehouseId를 props로 받습니다.
const RelocationRequired = ({ currentWarehouseId }) => { 
    const [relocationData, setRelocationData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!currentWarehouseId) {
            setIsLoading(false);
            return;
        }

        const loadData = async () => {
            setIsLoading(true); 
            try {
                // warehouseId를 인자로 전달하여 API 호출
                const data = await fetchRelocationList(currentWarehouseId); 
                setRelocationData(data);
            } catch (error) {
                console.error("위치 변경 목록을 불러오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [currentWarehouseId]); 

    // ⭐️ 수정된 헤더: 요청하신 상품, 수량, 유통기한을 중심으로 구성
    const headers = [
        '상품명',      // DTO: productName
        '수량',        // DTO: quantity
        '유통기한',    // DTO: expiryDate
        '문제 사유',    // DTO: issueReason
        // 필요하다면 GTIN과 STK ID 등을 숨겨진 컬럼으로 추가 가능
    ];

    if (isLoading) {
        return <InventoryListComponent 
            title="위치 변경 필요 재고 (로딩 중)" 
            data={[]} 
            headers={headers}
        />;
    }
    
    // InventoryListComponent가 DTO 객체를 받아 headers 순서에 맞게
    // 필드를 렌더링하도록 구현되어 있다고 가정합니다.
    return (
        <InventoryListComponent 
            title={`위치 변경 필요 재고 (${relocationData.length}건)`} 
            data={relocationData} 
            headers={headers}
        />
    );
};

export default RelocationRequired;