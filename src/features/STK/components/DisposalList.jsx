import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// =========================================================
// ⭐️ Mock API: 유통기한 만료 재고 목록을 시뮬레이션합니다.
// (실제 환경에서는 '../api/stockApi'에서 가져온 fetchDisposalList를 사용해야 합니다.)
// =========================================================

// 날짜를 "YYYY-MM-DD" 형식의 문자열로 포맷하는 헬퍼 함수
const formatDate = (date) => date.toISOString().split('T')[0];

const today = new Date();
const todayDate = formatDate(today);

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayDate = formatDate(yesterday);

const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const tomorrowDate = formatDate(tomorrow);

/**
 * 모의(Mock) API 함수
 */
const fetchDisposalList = async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); 

    return [
        // 1. 만료됨 (필터링 후 표시되어야 함) - lotId가 Long 타입이므로 숫자로 설정
        { lotId: 101, productName: '우유 1L (만료됨)', quantity: 20, expiryDate: yesterdayDate }, 
        { lotId: 102, productName: '요거트 (만료일 오늘)', quantity: 50, expiryDate: todayDate }, 
        { lotId: 103, productName: '파운드 케이크', quantity: 10, expiryDate: '2024-01-15' }, 
        { lotId: 107, productName: '시금치', quantity: 5, expiryDate: yesterdayDate },

        // 2. 만료되지 않음 (필터링 후 제외되어야 함)
        { lotId: 104, productName: '신선 계란 (미만료)', quantity: 100, expiryDate: tomorrowDate }, 
        { lotId: 105, productName: '물 500ml (미만료)', quantity: 300, expiryDate: '2026-12-31' }, 
        
        // 3. 날짜 누락/미만료 (필터링 후 제외되어야 함)
        { lotId: 106, productName: '캔디 (날짜 없음)', quantity: 5, expiryDate: null },
    ];
};
// =========================================================


const ITEMS_PER_PAGE = 15;

/**
 * 유통기한 만료 재고 목록을 표시하고, 폐기 수량을 입력받는 컴포넌트입니다.
 */
const DisposalList = () => {
    // disposalData: API로 불러온 재고 정보와 사용자가 입력한 quantity를 담는 상태
    const [disposalData, setDisposalData] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1); 
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const rawData = await fetchDisposalList(); 
                
                // 유통기한 만료 항목만 필터링
                const today = todayDate; 
                const expiredData = rawData.filter(item => {
                    return item.expiryDate && item.expiryDate <= today;
                });
                
                const initialData = expiredData.map(item => ({ 
                    ...item, 
                    stock: item.quantity, 
                    quantity: item.quantity || 0 // 폐기 수량 초기화 (기본값: 전량)
                }));

                setDisposalData(initialData);
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
    // 안전 접근을 위해 disposalData를 사용하기 전에 빈 배열로 대체
    const safeDisposalData = disposalData || []; 
    const totalPages = Math.ceil(safeDisposalData.length / ITEMS_PER_PAGE);

    const paginatedData = useMemo(() => {
        const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
        return safeDisposalData.slice(indexOfFirstItem, indexOfLastItem);
    }, [safeDisposalData, currentPage]);
    
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1)); 
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1)); 
    };
    
    // 핸들러: 수량 입력 변경 시 상태 업데이트
    const handleQuantityChange = (paginatedIndex, value) => {
        const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + paginatedIndex;
        
        const item = safeDisposalData[actualIndex];
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
        // ⭐️ 오류 해결: disposalData가 undefined일 경우 빈 배열로 대체 후 filter 적용
        const selectedForDisposal = (disposalData || []).filter(item => item.quantity > 0);

        if (selectedForDisposal.length === 0) {
            console.warn("폐기할 수량을 1개 이상 입력해주세요.");
            return;
        }

        // ⭐️ Long 타입 lotId 문제 해결: lotId를 숫자로 변환하고 DTO 구조에 맞게 매핑
        const itemsForDisposal = selectedForDisposal.map(item => ({
            // lotId를 명시적으로 숫자로 변환 (백엔드 Long 타입에 대응)
            lotId: Number(item.lotId), 
            // 백엔드가 targetQuantity를 기대한다고 가정
            targetQuantity: item.quantity, 
        }));

        // 변환된 DTO 형식 데이터를 다음 페이지로 전달합니다.
        // 실제 API 호출 로직은 이 다음 페이지나 별도 Service에서 처리됩니다.
        navigate('/stk/disposal', { state: { items: itemsForDisposal } });
    };

    // ⭐️ 오류 해결: disposalData가 undefined일 경우 빈 배열로 대체 후 reduce 적용
    const totalCount = (disposalData || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
    
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

            {safeDisposalData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>유통기한 만료된 폐기 대상 제품이 없습니다.</div>
            ) : (
                paginatedData.map((item, index) => {
                    const actualNo = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                    return (
                        <div key={item.lotId || actualNo} style={styles.itemRow}>
                            <span style={{ ...styles.col, flex: 0.5 }}>{actualNo}</span>
                            <div style={{ ...styles.col, flex: 3, padding: '0 10px' }}>
                                <div style={styles.productName}>{item.productName || item.name}</div>
                            </div>
                            <span style={{ ...styles.col, flex: 1.5, textAlign: 'right', justifyContent: 'flex-end' }}>
                                {item.expiryDate || 'N/A'}
                            </span>
                            
                            <div style={{ ...styles.col, flex: 2, display: 'flex', justifyContent: 'center' }}>
                                <input type="number" 
                                    value={item.quantity} 
                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                    min="0"
                                    max={item.stock}
                                    style={styles.quantityInput} 
                                />
                            </div>
                            
                            <span style={{ ...styles.col, flex: 1, textAlign: 'center', justifyContent: 'center' }}>
                                {item.stock}
                            </span>
                        </div>
                    )
                })
            )}

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
// 스타일 정의
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