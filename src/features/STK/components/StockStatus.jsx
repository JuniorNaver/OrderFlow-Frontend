import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {fetchStockStatusList} from '../api/stockApi'; 

import InventoryListComponent from './InventoryListComponent'; 

// ⭐️ 페이지당 항목 수 상수를 정의합니다.
const ITEMS_PER_PAGE = 15;

const StockStatus = () => {
    // 상태 관리
    const [stockData, setStockData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // ⭐️ 페이지네이션을 위한 현재 페이지 상태 (기본값: 1)
    const [currentPage, setCurrentPage] = useState(1); 

    // 재고 목록을 불러오는 함수 (전체 재고 현황 테이블)
    const loadStockData = async () => {
        try {
            // ⭐️ 원래 API 호출 함수 사용
            const rawData = await fetchStockStatusList(); 
            const arrayData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
            
            const mappedData = arrayData.map(item => {
                return {
                    // InventoryListComponent에서 사용할 필드 이름으로 매핑
                    name: item.name,        // 제품명
                    warehouseId: item.warehouseId, // 보관 위치
                    // 수량 포맷팅
                    quantity: item.quantity ? item.quantity.toLocaleString() + ' EA' : '0 EA' 
                };
            });

            console.log("InventoryListComponent에 전달될 Mapped Data:", mappedData);
            setStockData(mappedData);
            // 새로운 데이터가 로드되면 현재 페이지를 1로 리셋합니다.
            setCurrentPage(1); 

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

    // ⭐️ 페이지네이션 로직 계산
    // 전체 페이지 수를 계산합니다.
    const totalPages = Math.ceil(stockData.length / ITEMS_PER_PAGE);

    // 현재 페이지에 표시할 데이터를 계산합니다. (stockData와 currentPage가 변경될 때만 재계산)
    const paginatedData = useMemo(() => {
        const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
        return stockData.slice(indexOfFirstItem, indexOfLastItem);
    }, [stockData, currentPage]);

    // 페이지 변경 핸들러
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1)); // 1페이지 미만으로 내려가지 않도록 합니다.
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1)); // 마지막 페이지를 넘지 않도록 합니다.
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div>오류: {error}</div>;

    // 랜더링 로직
    return (
        <div className="stock-status-page">
            <h2>📊 현재 재고 현황 조회</h2>
            <InventoryListComponent 
                title="전체 재고 현황 (품목별)"
                headers={['제품명', '보관 위치', '현재 수량']}
                data={paginatedData} // ⭐️ 페이지네이션된 데이터를 전달합니다.
                // 이전 요청에서 제공하신 dataMapper 로직 유지
                dataMapper={(item, header) => {
                    switch(header) {
                        case '제품명': return item.name;
                        case '보관 위치': return item.warehouseId;
                        case '현재 수량': return item.quantity;
                        default: return '';
                    }
                }}
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

// ⭐️ PropTypes는 사용자님의 원래 코드에 있었으므로 다시 추가합니다.
InventoryListComponent.propTypes = {
    title: PropTypes.string.isRequired,
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    dataMapper: PropTypes.func.isRequired,
};

export default StockStatus;