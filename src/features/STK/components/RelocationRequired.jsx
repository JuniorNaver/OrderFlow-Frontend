import React, { useState, useEffect, useMemo } from 'react'; // useMemo 추가
import InventoryListComponent from './InventoryListComponent';
import { fetchRelocationList } from '../api/stockApi';

// ⭐️ 페이지당 항목 수 상수를 정의합니다.
const ITEMS_PER_PAGE = 15;

// currentWarehouseId를 props로 받습니다.
const RelocationRequired = ({ currentWarehouseId }) => { 
    const [relocationData, setRelocationData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // ⭐️ 페이지네이션을 위한 현재 페이지 상태를 추가합니다. (기본값: 1)
    const [currentPage, setCurrentPage] = useState(1); 
    
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
                // ⭐️ 새로운 데이터가 로드되면 현재 페이지를 1로 리셋합니다.
                setCurrentPage(1); 
            } catch (error) {
                console.error("위치 변경 목록을 불러오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [currentWarehouseId]); 

    // ⭐️ 페이지네이션 로직 계산
    // 1. 전체 페이지 수를 계산합니다.
    const totalPages = Math.ceil(relocationData.length / ITEMS_PER_PAGE);

    // 2. 현재 페이지에 표시할 데이터를 계산합니다. (relocationData와 currentPage가 변경될 때만 재계산)
    const paginatedData = useMemo(() => {
        const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
        return relocationData.slice(indexOfFirstItem, indexOfLastItem);
    }, [relocationData, currentPage]);

    // 3. 페이지 변경 핸들러
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1)); // 1페이지 미만으로 내려가지 않도록 합니다.
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1)); // 마지막 페이지를 넘지 않도록 합니다.
    };
    
    // ⭐️ 수정된 헤더: 요청하신 상품, 수량, 유통기한을 중심으로 구성
    const headers = [
        '상품명',
        '수량',
        '유통기한',
        '문제 사유',
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
        <div className="relocation-required-container">
            <InventoryListComponent 
                title={`위치 변경 필요 재고 (${relocationData.length}건)`} 
                data={paginatedData} // ⭐️ 페이지네이션된 데이터를 전달합니다.
                headers={headers}
            />

            {/* ⭐️ 페이지네이션 UI (전체 페이지가 1보다 클 경우에만 표시) */}
            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
                    <button 
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        &larr; 이전
                    </button>
                    
                    <span style={{ padding: '8px 0', fontWeight: 'bold' }}>
                        {currentPage} / {totalPages} 페이지
                    </span>
                    
                    <button 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        다음 &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default RelocationRequired;