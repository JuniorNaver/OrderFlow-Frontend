import React, { useState, useEffect } from 'react'; // 👈 useState, useEffect 추가
import InventoryListComponent from './InventoryListComponent';
import { fetchRelocationList } from '../api/stockApi'; // 👈 API import

// ⭐️ Mock Data 제거: const DUMMY_RELOCATION_DATA = ...

const RelocationRequired = () => {
    const [relocationData, setRelocationData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchRelocationList(); // API 호출
                setRelocationData(data);
            } catch (error) {
                console.error("위치 변경 목록을 불러오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading) {
        // 로딩 중일 때 빈 목록 컴포넌트에 빈 배열 전달
        return <InventoryListComponent 
                    title="위치 변경 필요 재고" 
                    data={[]} 
                    headers={['제품명', '현재 위치', '수량']}
                />;
    }
    
    return (
        <InventoryListComponent 
            title="위치 변경 필요 재고" 
            data={relocationData} // 👈 상태 데이터 사용
            headers={['제품명', '현재 위치', '수량']}
        />
    );
};

export default RelocationRequired;