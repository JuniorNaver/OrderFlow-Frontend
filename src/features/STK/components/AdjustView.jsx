// src/features/STK/components/AdjustView.jsx

import React, { useState, useEffect, useMemo } from 'react'; // ⭐️ useMemo 추가
import { fetchAdjustmentList, executeStockAdjustment } from '../api/stockApi'; 

// ⭐️ 페이지당 항목 수 상수를 정의합니다.
const ITEMS_PER_PAGE = 15;

const AdjustView = () => {
    const [adjustmentLots, setAdjustmentLots] = useState([]);
    // ⭐️ 페이지네이션을 위한 현재 페이지 상태를 추가합니다. (기본값: 1)
    const [currentPage, setCurrentPage] = useState(1); 
    
    // ⭐️ 1. 컴포넌트 마운트 시 조정 목록 로드
    useEffect(() => {
        const loadAdjustmentList = async () => {
            try {
                const items = await fetchAdjustmentList(); 
                setAdjustmentLots(items.map(item => ({
                    ...item,
                    // '조정할 수량' 필드를 위해 별도 상태 필드 추가
                    newQuantity: item.quantity, 
                })));
                // ⭐️ 새 목록 로드 시 페이지 리셋
                setCurrentPage(1);
            } catch (error) {
                console.error("조정 목록을 불러오는 데 실패했습니다:", error);
            }
        };
        loadAdjustmentList();
    }, []);

    // ------------------------------------------------------------------
    // ⭐️ 2. 페이지네이션 로직 계산
    // ------------------------------------------------------------------
    // 전체 페이지 수를 계산합니다.
    const totalPages = Math.ceil(adjustmentLots.length / ITEMS_PER_PAGE);

    // 현재 페이지에 표시할 데이터를 계산합니다.
    const paginatedData = useMemo(() => {
        const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
        return adjustmentLots.slice(indexOfFirstItem, indexOfLastItem);
    }, [adjustmentLots, currentPage]);
    
    // 페이지 변경 핸들러
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1)); // 1페이지 미만으로 내려가지 않도록 합니다.
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1)); // 마지막 페이지를 넘지 않도록 합니다.
    };

    // ⭐️ 3. 조정 수량 변경 핸들러 (전체 목록을 Lot ID 기준으로 업데이트)
    const handleQuantityChange = (lotId, value) => {
        const quantity = parseInt(value) || 0; 
        
        setAdjustmentLots(prev => 
            prev.map(item => 
                item.lotId === lotId ? { ...item, newQuantity: quantity } : item
            )
        );
    };

    // ⭐️ 4. 최종 조정 요청 핸들러 (페이징과 무관하게 전체 목록 사용)
    const handleSubmitAdjustment = async () => {
        const itemsToAdjust = adjustmentLots
            .filter(item => item.newQuantity !== item.quantity); // 현재 수량과 조정 수량이 다를 때만 전송

        if (itemsToAdjust.length === 0) {
            alert("조정할 수량이 없습니다. 수량을 변경해주세요.");
            return;
        }

        const requestDTO = {
            items: itemsToAdjust.map(item => ({
                lotId: item.lotId,
                // 백엔드에서 필요한 DTO 구조에 맞게 변경 (예: targetQuantity)
                targetQuantity: item.newQuantity 
            }))
        };

        try {
            await executeStockAdjustment(requestDTO);
            alert(`✅ 재고 조정이 성공적으로 처리되었습니다.`);
            
            // 조정 성공 후, 목록에서 조정된 항목을 제거하거나 수량을 업데이트
            setAdjustmentLots(prev => {
                const newLots = prev.filter(item => {
                    const adjustedItem = itemsToAdjust.find(a => a.lotId === item.lotId);
                    // 조정 후 수량이 0보다 커져서 더 이상 조정 대상이 아닐 경우 리스트에서 제거 (또는 조정 후 수량이 0인 경우에만 제거)
                    // 여기서는 조정 요청을 보냈고, 수량이 0이 되었을 경우에만 리스트에서 제외하는 것으로 로직을 수정했습니다.
                    return !(adjustedItem && adjustedItem.newQuantity <= 0); 
                });

                // ⭐️ 데이터가 줄어들어 페이지가 사라질 경우 현재 페이지를 최대 페이지로 조정합니다.
                const newTotalPages = Math.ceil(newLots.length / ITEMS_PER_PAGE);
                setCurrentPage(prev => Math.min(prev, newTotalPages || 1));
                
                return newLots;
            });
            
        } catch (error) {
            console.error("재고 조정 중 API 오류 발생:", error);
            alert("재고 조정 중 오류가 발생했습니다.");
        }
    };
    
    // ... (렌더링 부분)
    return (
        <div style={containerStyle}>
            <h2>📊 재고 수량 조정 (FIFO 오류/수량 불일치)</h2>
            <p>FIFO 위반, 수량 불일치(0 이하) 등의 사유로 조정이 필요한 랏 목록입니다. *재고 조사 결과에 따라 정확한 수량을 입력하세요.</p>
            
            <h3 style={styles.listTitle}>조정 대상 목록 ({adjustmentLots.length}개 랏)</h3>
            
            {/* 테이블 헤더 */}
            <div style={styles.headerRow}>
                <span style={styles.colHeader}>Lot ID</span>
                <span style={{...styles.colHeader, flex: 3}}>제품명</span>
                <span style={styles.colHeader}>보관 위치</span>
                <span style={styles.colHeader}>유통기한</span>
                <span style={styles.colHeader}>현재 수량</span>
                <span style={{...styles.colHeader, flex: 2}}>**조정할 수량 입력**</span>
            </div>

            {/* 테이블 데이터 */}
            {paginatedData.length === 0 ? (
                <div style={styles.emptyMessage}>조정 대상 재고가 없습니다.</div>
            ) : (
                // ⭐️ paginatedData를 렌더링합니다.
                paginatedData.map((item) => (
                    <div key={item.lotId} style={styles.dataRow}>
                        <span style={styles.col}>{item.lotId}</span>
                        <span style={{...styles.col, flex: 3}}>{item.productName}</span>
                        <span style={styles.col}>{item.location}</span>
                        <span style={styles.col}>{item.expiryDate}</span>
                        <span style={{...styles.col, color: item.quantity <= 0 ? 'red' : 'inherit'}}>{item.quantity}</span>
                        <span style={{...styles.col, flex: 2}}>
                            <input
                                type="number"
                                value={item.newQuantity}
                                // ⭐️ lotId를 사용하여 전체 목록(adjustmentLots)에서 해당 항목을 정확히 찾아 업데이트합니다.
                                onChange={(e) => handleQuantityChange(item.lotId, e.target.value)}
                                style={styles.quantityInput}
                            />
                        </span>
                    </div>
                ))
            )}
            
            {/* ⭐️ 페이지네이션 UI (전체 페이지가 1보다 클 경우에만 표시) */}
            {totalPages > 1 && (
                <div className="pagination-controls" style={styles.paginationControls}>
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
            
            <div style={styles.footer}>
                <button 
                    onClick={handleSubmitAdjustment} 
                    style={styles.submitButton}
                >
                    선택 항목 재고 조정 요청
                </button>
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// ⭐️ 스타일 정의 (인라인 스타일을 간결하게 정의)
// ------------------------------------------------------------------

const containerStyle = { 
    padding: '20px', 
    backgroundColor: '#fff', 
    borderRadius: '8px', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
};

const styles = {
    listTitle: { 
        fontSize: '1.2rem', 
        fontWeight: '600', 
        borderBottom: '2px solid #343a40', 
        paddingBottom: '10px', 
        margin: '15px 0' 
    },
    headerRow: { 
        display: 'flex', 
        fontWeight: 'bold', 
        padding: '10px', 
        backgroundColor: '#e9ecef', 
        borderBottom: '1px solid #ced4da' 
    },
    dataRow: { 
        display: 'flex', 
        padding: '10px', 
        borderBottom: '1px dotted #eee', 
        alignItems: 'center'
    },
    colHeader: { 
        flex: 1.5, 
        textAlign: 'center' 
    },
    col: { 
        flex: 1.5,
        padding: '0 5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center' // 중앙 정렬 유지
    },
    quantityInput: {
        width: '100px', 
        padding: '5px', 
        textAlign: 'center',
        border: '1px solid #ced4da', 
        borderRadius: '4px'
    },
    footer: {
        marginTop: '20px', 
        textAlign: 'right'
    },
    submitButton: {
        padding: '10px 20px', 
        backgroundColor: '#007bff', 
        color: 'white',
        border: 'none', 
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    emptyMessage: {
        textAlign: 'center', 
        padding: '30px', 
        color: '#6c757d'
    },
    // ⭐️ 페이지네이션 스타일
    paginationControls: { 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '20px', 
        gap: '10px' 
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
        fontWeight: 'bold',
        fontSize: '1rem'
    }
};

export default AdjustView;