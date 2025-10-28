import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {fetchStockStatusList} from '../api/stockApi'; 

import InventoryListComponent from './InventoryListComponent'; 

// ⭐️ 페이지당 항목 수 상수를 정의합니다.
const ITEMS_PER_PAGE = 15;
// ⭐️ 한 블록당 페이지 수 상수를 정의합니다. (요청하신 10으로 설정)
const PAGES_PER_BLOCK = 10;

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
    
    // ⭐️ 페이지 블록 관련 계산
    const totalBlocks = Math.ceil(totalPages / PAGES_PER_BLOCK); // 전체 블록 수
    const currentBlock = Math.ceil(currentPage / PAGES_PER_BLOCK); // 현재 페이지가 속한 블록 번호
    const startPage = (currentBlock - 1) * PAGES_PER_BLOCK + 1; // 현재 블록의 시작 페이지
    // 현재 블록의 끝 페이지는 totalPages를 넘지 않도록 합니다.
    const endPage = Math.min(startPage + PAGES_PER_BLOCK - 1, totalPages); 

    // 현재 페이지에 표시할 데이터를 계산합니다. (stockData와 currentPage가 변경될 때만 재계산)
    const paginatedData = useMemo(() => {
        const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
        // 페이지가 바뀌면 데이터 범위도 같이 바뀝니다.
        return stockData.slice(indexOfFirstItem, indexOfLastItem);
    }, [stockData, currentPage]);

    // ⭐️ 페이지 변경 핸들러
    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 이전 페이지 변경 핸들러 (기존 로직 유지)
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    // 다음 페이지 변경 핸들러 (기존 로직 유지)
    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    // ⭐️ 이전 블록으로 이동
    const handlePrevBlock = () => {
        // 이전 블록의 첫 페이지로 이동 (예: 11페이지에서 << 클릭 시 1페이지로)
        const newPage = Math.max(1, startPage - PAGES_PER_BLOCK);
        setCurrentPage(newPage);
    };

    // ⭐️ 다음 블록으로 이동
    const handleNextBlock = () => {
        // 다음 블록의 첫 페이지로 이동 (예: 1페이지에서 >> 클릭 시 11페이지로)
        const newPage = Math.min(totalPages, endPage + 1);
        // 만약 newPage가 totalPages를 넘어가는 경우 (마지막 블록에서 클릭 시), totalPages로 설정됩니다.
        setCurrentPage(newPage);
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
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '5px' }}>
                    
                    {/* ⭐️ 이전 블록 버튼 (첫 블록이 아닐 때만 표시) */}
                    {currentBlock > 1 && (
                        <button 
                            onClick={handlePrevBlock}
                            style={{ 
                                padding: '8px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', 
                                transition: 'background-color 0.3s', 
                                minWidth: '35px', fontWeight: 'bold'
                            }}
                        >
                            &lt;&lt;
                        </button>
                    )}

                    {/* 기존 이전 페이지 버튼 */}
                    <button 
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        style={{ 
                            padding: '8px 12px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', 
                            opacity: currentPage === 1 ? 0.6 : 1, transition: 'opacity 0.3s'
                        }}
                    >
                        &larr; 이전
                    </button>
                    
                    {/* ⭐️ 페이지 번호 버튼 리스트 */}
                    {/* startPage부터 endPage까지 배열을 만들고 매핑합니다. */}
                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageClick(page)}
                            style={{ 
                                padding: '8px 12px', 
                                cursor: 'pointer', 
                                border: `1px solid ${currentPage === page ? '#0056b3' : '#dee2e6'}`, 
                                borderRadius: '4px',
                                fontWeight: currentPage === page ? 'bold' : 'normal',
                                backgroundColor: currentPage === page ? '#0056b3' : '#f8f9fa',
                                color: currentPage === page ? 'white' : '#007bff',
                                transition: 'background-color 0.3s, color 0.3s',
                                minWidth: '35px'
                            }}
                        >
                            {page}
                        </button>
                    ))}
                    
                    {/* 기존 다음 페이지 버튼 */}
                    <button 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        style={{ 
                            padding: '8px 12px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', 
                            opacity: currentPage === totalPages ? 0.6 : 1, transition: 'opacity 0.3s'
                        }}
                    >
                        다음 &rarr;
                    </button>

                    {/* ⭐️ 다음 블록 버튼 (마지막 블록이 아닐 때만 표시) */}
                    {currentBlock < totalBlocks && (
                        <button 
                            onClick={handleNextBlock}
                            style={{ 
                                padding: '8px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px',
                                transition: 'background-color 0.3s',
                                minWidth: '35px', fontWeight: 'bold'
                            }}
                        >
                            &gt;&gt;
                        </button>
                    )}
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