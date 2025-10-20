import React, { useState, useEffect, useCallback } from 'react'; 
import { fetchAdjustmentList, executeStockAdjustment } from '../api/stockApi'; // 필요한 API 함수 임포트

/**
 * ⭐️ 재고 수량 조정 페이지 컴포넌트입니다.
 * FIFO 오류 또는 수량 불일치 재고를 표시하고 조정합니다.
 */
const StockAdjustmentView = () => {
    // adjustmentLots는 { lotId, productName, location, expiryDate, quantity (현재 재고), newQuantity (조정 입력값) }을 포함합니다.
    const [adjustmentLots, setAdjustmentLots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ------------------------------------------------------------------
    // 1. 초기 목록 로드: 컴포넌트 마운트 시 조정 대상 재고를 불러옴
    // ------------------------------------------------------------------
    useEffect(() => {
        const loadAdjustmentList = async () => {
            setIsLoading(true);
            try {
                // /api/stk/list/adjustment API 호출
                const items = await fetchAdjustmentList(); 
                
                setAdjustmentLots(items.map(item => ({
                    ...item,
                    // 현재 수량(quantity)을 초기 조정 수량(newQuantity)으로 설정
                    newQuantity: item.quantity, 
                })));
                setError(null);
            } catch (err) {
                console.error("조정 목록을 불러오는 데 실패했습니다:", err);
                setError("조정 대상 목록을 불러오는 중 오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        };
        loadAdjustmentList();
    }, []);

    // ------------------------------------------------------------------
    // 2. 수량 변경 핸들러
    // ------------------------------------------------------------------
    const handleQuantityChange = useCallback((lotId, value) => {
        const quantity = parseInt(value) || 0; 
        
        setAdjustmentLots(prev => 
            prev.map(item => 
                item.lotId === lotId ? { ...item, newQuantity: quantity } : item
            )
        );
    }, []);

    // ------------------------------------------------------------------
    // 3. 최종 조정 요청 핸들러
    // ------------------------------------------------------------------
    const handleSubmitAdjustment = async () => {
        // 현재 수량(quantity)과 조정할 수량(newQuantity)이 다른 항목만 필터링
        const itemsToAdjust = adjustmentLots
            .filter(item => item.newQuantity !== item.quantity); 

        if (itemsToAdjust.length === 0) {
            alert("조정할 수량이 없습니다. 수량을 변경해주세요.");
            return;
        }

        const requestDTO = {
            items: itemsToAdjust.map(item => ({
                lotId: item.lotId,
                targetQuantity: item.newQuantity 
            }))
        };

        try {
            // API 호출: 재고 조정 실행
            const updatedStocks = await executeStockAdjustment(requestDTO); 
            
            alert(`✅ 재고 조정이 성공적으로 처리되었습니다. (총 ${itemsToAdjust.length}개 랏 처리)`);
            
            // 조정 성공 후, 목록 업데이트:
            // 1. 조정된 랏의 현재 수량을 업데이트하고,
            // 2. 조정 후 수량이 0보다 커져서 더 이상 '조정 대상'이 아닐 경우 리스트에서 제거
            setAdjustmentLots(prev => 
                prev.map(item => {
                    const updatedItem = updatedStocks.find(s => s.lotId === item.lotId);
                    
                    if (updatedItem) {
                        // 조정 후 수량이 0보다 크면 (조정 대상 아님) 리스트에서 제외하기 위해 null 반환
                        if (updatedItem.quantity > 0) return null; 
                        
                        // 조정 후 수량이 0 이하라면 (여전히 조정 대상일 수 있음) 수량 업데이트
                        return { ...item, quantity: updatedItem.quantity, newQuantity: updatedItem.quantity };
                    }
                    return item; // 업데이트되지 않은 항목은 그대로 유지
                }).filter(Boolean) // null 항목 제거 (조정 후 수량이 0보다 커진 항목)
            );
            
        } catch (err) {
            console.error("재고 조정 중 API 오류 발생:", err);
            alert(`재고 조정 중 오류가 발생했습니다. 상세: ${err.message}`);
        }
    };

    // ------------------------------------------------------------------
    // 4. 렌더링
    // ------------------------------------------------------------------
    
    // 로딩 및 오류 처리
    if (isLoading) {
        return <div style={loadingStyle}>조정 대상 재고 목록을 불러오는 중입니다...</div>;
    }

    if (error) {
        return <div style={{...loadingStyle, color: 'red'}}>{error}</div>;
    }

    return (
        <div style={containerStyle}>
            <h2 style={headerStyle}>
                ⚙️ 재고 수량 조정
            </h2>
            
            <p style={descriptionStyle}>
                여기는 실사 결과나 FIFO 원칙 위반 등으로 인해 수량 불일치(0 이하)가 발생한 재고를 조정하는 페이지입니다.
            </p>
            
            <h3 style={listTitleStyle}>조정 대상 목록 ({adjustmentLots.length}개 랏)</h3>
            
            {/* 테이블 */}
            <div style={styles.table}>
                <div style={styles.headerRow}>
                    <span style={{...styles.col, flex: 1}}>Lot ID</span>
                    <span style={{...styles.col, flex: 3}}>제품명</span>
                    <span style={{...styles.col, flex: 1.5}}>보관 위치</span>
                    <span style={{...styles.col, flex: 1.5}}>유통기한</span>
                    <span style={{...styles.col, flex: 1.5}}>현재 수량</span>
                    <span style={{...styles.col, flex: 2}}>**조정할 수량 입력**</span>
                </div>

                {adjustmentLots.length === 0 ? (
                    <div style={styles.emptyMessage}>현재 수량 조정이 필요한 항목이 없습니다.</div>
                ) : (
                    adjustmentLots.map((item) => (
                        <div key={item.lotId} style={styles.dataRow}>
                            <span style={{...styles.col, flex: 1, fontWeight: 'bold'}}>{item.lotId}</span>
                            <span style={{...styles.col, flex: 3}}>{item.productName}</span>
                            <span style={{...styles.col, flex: 1.5}}>{item.location}</span>
                            <span style={{...styles.col, flex: 1.5}}>{item.expiryDate}</span>
                            {/* 현재 수량이 0 이하인 경우 경고색 표시 */}
                            <span style={{...styles.col, flex: 1.5, textAlign: 'right', color: item.quantity <= 0 ? '#dc3545' : '#343a40'}}>
                                {item.quantity}
                            </span>
                            <span style={{...styles.col, flex: 2, justifyContent: 'center'}}>
                                <input
                                    type="number"
                                    min="0"
                                    value={item.newQuantity}
                                    onChange={(e) => handleQuantityChange(item.lotId, e.target.value)}
                                    style={styles.quantityInput}
                                />
                            </span>
                        </div>
                    ))
                )}
            </div>
            
            <div style={styles.footer}>
                <button 
                    onClick={handleSubmitAdjustment} 
                    disabled={adjustmentLots.length === 0}
                    style={adjustmentLots.length > 0 ? styles.submitButton : styles.disabledButton}
                >
                    선택 항목 재고 조정 요청 ({adjustmentLots.filter(item => item.newQuantity !== item.quantity).length}개 랏)
                </button>
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// ⭐️ 스타일 정의
// ------------------------------------------------------------------
const containerStyle = { padding: '20px', backgroundColor: '#ffffff', minHeight: '80vh', borderRadius: '8px' };
const headerStyle = { fontSize: '1.5rem', fontWeight: '700', color: '#17a2b8', borderBottom: '2px solid #17a2b8', paddingBottom: '10px', marginBottom: '20px' };
const descriptionStyle = { color: '#6c757d', fontSize: '1.1rem', marginBottom: '30px' };
const listTitleStyle = { fontSize: '1.2rem', fontWeight: '600', borderBottom: '2px solid #343a40', paddingBottom: '10px', margin: '15px 0' };
const loadingStyle = { textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#007bff' };

const styles = {
    table: { border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' },
    headerRow: { display: 'flex', fontWeight: 'bold', padding: '10px', backgroundColor: '#e9ecef', borderBottom: '1px solid #ced4da' },
    dataRow: { display: 'flex', padding: '10px', borderBottom: '1px dotted #eee', backgroundColor: 'white' },
    col: { padding: '0 5px', alignItems: 'center', display: 'flex', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    
    emptyMessage: { textAlign: 'center', padding: '30px', color: '#6c757d', backgroundColor: 'white' },
    
    quantityInput: { width: '80px', padding: '5px', textAlign: 'center', border: '1px solid #ced4da', borderRadius: '3px' },
    
    footer: { marginTop: '20px', textAlign: 'right' },
    submitButton: { padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    disabledButton: { padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'not-allowed', fontWeight: 'bold' },
};

export default StockAdjustmentView;