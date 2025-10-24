import React, { useState, useEffect, useMemo } from 'react'; // useMemo 추가
import { fetchDisposalList } from '../api/stockApi'; 
import { useNavigate } from 'react-router-dom';

// ⭐️ 페이지당 항목 수 상수를 정의합니다.
const ITEMS_PER_PAGE = 15;

/**
 * 유통기한 만료 재고 목록을 표시하고, 폐기 수량을 입력받는 컴포넌트입니다.
 */
const DisposalList = () => {
    // disposalData: API로 불러온 재고 정보와 사용자가 입력한 quantity를 담는 상태
    const [disposalData, setDisposalData] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    // ⭐️ 페이지네이션을 위한 현재 페이지 상태를 추가합니다. (기본값: 1)
    const [currentPage, setCurrentPage] = useState(1); 
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const rawData = await fetchDisposalList(); 
                
                const initialData = rawData.map(item => ({ 
                    ...item, 
                    stock: item.quantity, 
                    quantity: item.quantity || 0 // 폐기 수량 초기화 (기본값: 전량)
                }));

                setDisposalData(initialData);
                // ⭐️ 새로운 데이터가 로드되면 현재 페이지를 1로 리셋합니다.
                setCurrentPage(1); 
            } catch (error) {
                console.error("폐기 목록 데이터를 불러오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // ⭐️ 페이지네이션 로직 계산
    // 1. 전체 페이지 수를 계산합니다.
    const totalPages = Math.ceil(disposalData.length / ITEMS_PER_PAGE);

    // 2. 현재 페이지에 표시할 데이터를 계산합니다. (disposalData와 currentPage가 변경될 때만 재계산)
    // 중요한 점: handleQuantityChange의 index는 paginatedData의 인덱스 기준이 아닌
    // disposalData의 인덱스 기준이 되어야 합니다.
    const paginatedData = useMemo(() => {
        const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
        return disposalData.slice(indexOfFirstItem, indexOfLastItem);
    }, [disposalData, currentPage]);
    
    // 3. 페이지 변경 핸들러
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1)); // 1페이지 미만으로 내려가지 않도록 합니다.
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1)); // 마지막 페이지를 넘지 않도록 합니다.
    };
    
    // 핸들러: 수량 입력 변경 시 상태 업데이트
    const handleQuantityChange = (paginatedIndex, value) => {
        // ⭐️ paginatedIndex를 실제 disposalData의 index로 변환합니다.
        const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + paginatedIndex;
        
        const item = disposalData[actualIndex];
        const maxStock = item.stock || item.quantity; 
        const newQuantity = Math.max(0, Math.min(parseInt(value) || 0, maxStock));
        
        setDisposalData(prevData => 
            prevData.map((dataItem, i) => 
                i === actualIndex ? { ...dataItem, quantity: newQuantity } : dataItem
            )
        );
    };

   // 폐기 페이지 이동 핸들러 (선택된 재고를 가지고 이동)
    const handleGoToDisposalPage = () => {
        const selectedForDisposal = disposalData.filter(item => item.quantity > 0);

        if (selectedForDisposal.length === 0) {
            alert("폐기할 수량을 1개 이상 입력해주세요.");
            return;
        }

        navigate('/stk/disposal', { state: { items: selectedForDisposal } });
    };

    const totalCount = disposalData.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>폐기 목록 로딩 중...</div>;
    }

    // 목록 렌더링
    return (
        <div style={containerStyles}>
            <div style={styles.header}>
                <span style={{ ...styles.col, flex: 0.5 }}>NO</span>
                <span style={{ ...styles.col, flex: 3 }}>제품명</span>
                <span style={{ ...styles.col, flex: 1.5 }}>만료일</span>
                <span style={{ ...styles.col, flex: 2, justifyContent: 'center' }}>폐기 수량</span>
                <span style={{ ...styles.col, flex: 1, justifyContent: 'center' }}>가용 재고</span>
            </div>

            {paginatedData.length === 0 && disposalData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>유통기한 만료된 폐기 대상 제품이 없습니다.</div>
            ) : (
                // ⭐️ disposalData 대신 paginatedData를 매핑합니다.
                paginatedData.map((item, index) => {
                    // ⭐️ NO 표시를 현재 페이지에 맞게 계산합니다.
                    const actualNo = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                    return (
                        // API 응답에 Lot ID가 없으므로 index를 key로 사용 (경고 방지)
                        <div key={item.lotId || actualNo} style={styles.itemRow}>
                            <span style={{ ...styles.col, flex: 0.5 }}>{actualNo}</span>
                            <div style={{ ...styles.col, flex: 3, padding: '0 10px' }}>
                                <div style={styles.productName}>{item.productName || item.name}</div>
                            </div>
                            <span style={{ ...styles.col, flex: 1.5, textAlign: 'right', justifyContent: 'flex-end' }}>
                                {item.expiryDate || 'N/A'}
                            </span>
                            
                            {/* 폐기 수량 입력 필드 */}
                            <div style={{ ...styles.col, flex: 2, display: 'flex', justifyContent: 'center' }}>
                                <input type="number" 
                                    // ⭐️ item.quantity는 disposalData에서 가져온 현재 수량입니다.
                                    value={item.quantity} 
                                    // ⭐️ paginatedData의 index를 전달합니다.
                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                    min="0"
                                    max={item.stock}
                                    style={styles.quantityInput} 
                                />
                            </div>
                            
                            {/* 가용 재고 */}
                            <span style={{ ...styles.col, flex: 1, textAlign: 'center', justifyContent: 'center' }}>
                                {item.stock}
                            </span>
                        </div>
                    )
                })
            )}

            {/* ⭐️ 페이지네이션 UI (전체 페이지가 1보다 클 경우에만 표시) */}
            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
                    <button 
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        style={styles.pageButton}
                    >
                        &larr; 이전
                    </button>
                    
                    <span style={styles.pageInfo}>
                        {currentPage} / {totalPages} 페이지
                    </span>
                    
                    <button 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        style={styles.pageButton}
                    >
                        다음 &rarr;
                    </button>
                </div>
            )}
            
            {/* 폐기 버튼 영역 */}
            <div style={styles.footer}>
                <button 
                    onClick={handleGoToDisposalPage}
                    disabled={totalCount === 0}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: totalCount > 0 ? '#dc3545' : '#6c757d', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: totalCount > 0 ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold'
                    }}
                >
                    선택 품목 폐기 처리 (총 {totalCount}개 선택됨)
                </button>
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// 스타일 정의 (페이징 버튼 스타일 추가)
// ------------------------------------------------------------------

const containerStyles = {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const styles = {
    header: { 
        display: 'flex', 
        fontWeight: 'bold', 
        padding: '10px 0', 
        borderBottom: '3px solid #343a40', 
        fontSize: '0.9rem',
        backgroundColor: '#f8f9fa'
    },
    itemRow: { 
        display: 'flex', 
        alignItems: 'center',
        padding: '10px 0', 
        borderBottom: '1px dotted #eee', 
        fontSize: '0.95rem',
    },
    col: { 
        padding: '0 5px',
        minHeight: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    productName: {
        fontWeight: '500',
        color: '#343a40'
    },
    quantityInput: {
        width: '80px', 
        textAlign: 'center',
        padding: '6px',
        border: '1px solid #ced4da',
        borderRadius: '4px'
    },
    footer: {
        marginTop: '20px',
        textAlign: 'right',
        borderTop: '1px solid #eee',
        paddingTop: '15px'
    },
    pageButton: {
        padding: '8px 16px', 
        cursor: 'pointer', 
        backgroundColor: '#007bff', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px'
    },
    pageInfo: {
        padding: '8px 0', 
        fontWeight: 'bold'
    }
};

export default DisposalList;
