import React, { useState, useCallback } from 'react'; 
import { fetchStockByGtin } from '../api/stockApi'; 
import BarcodeListener from '../../SD/components/BarcodeListener';

const DisposalEntryView = () => {
    const [scannedGtin, setScannedGtin] = useState('');
    const [disposalLots, setDisposalLots] = useState([]); 
    // const navigate = useNavigate(); // 👈 ⭐️ 제거됨: useNavigate 선언

    // ⭐️ 핸들러: 폐기 수량 변경 (불변성 유지)
    const handleQuantityChange = (lotId, value, maxQuantity) => {
        const newQuantity = Math.max(0, Math.min(parseInt(value) || 0, maxQuantity));
        
        setDisposalLots(prev => 
            prev.map(item => 
                item.lotId === lotId ? { ...item, disposalQuantity: newQuantity } : item
            )
        );
    };

    // ⭐️ 핸들러: 바코드 스캔 및 재고 조회 (useCallback 유지)
    const processBarcodeScan = useCallback(async (gtinToScan) => {
        if (!gtinToScan) return;
        setScannedGtin(''); 

        try {
            // GTIN으로 해당 재고의 모든 랏(Lot)을 조회
            const stockDetails = await fetchStockByGtin(gtinToScan); 
            
            if (stockDetails.length === 0) {
                alert(`GTIN ${gtinToScan}에 해당하는 활성 재고가 없습니다.`);
                return;
            }

            // 기존 목록에 중복 없이 추가 (Lot ID 기준)
            setDisposalLots(prev => {
                const existingLotIds = new Set(prev.map(item => item.lotId));
                
                const filteredNewItems = stockDetails
                    .filter(item => !existingLotIds.has(item.lotId))
                    .map(item => ({
                        ...item,
                        disposalQuantity: 0, 
                    }));
                    
                return [...prev, ...filteredNewItems];
            });

        } catch (error) {
            console.error("재고 조회 중 오류 발생:", error);
            alert("재고 정보를 불러오는 데 실패했습니다.");
        }
    }, []); 

    // ⭐️ 핸들러: 수동 입력 필드에서 버튼 클릭 시 처리
    const handleManualEntry = () => {
        processBarcodeScan(scannedGtin.trim());
    };
    
    // ⭐️ 최종 폐기 요청 핸들러
    const handleSubmitDisposal = () => {
        const itemsToDispose = disposalLots.filter(item => item.disposalQuantity > 0);
        
        if (itemsToDispose.length === 0) {
            alert("폐기할 수량을 1개 이상 입력해주세요.");
            return;
        }

        console.log("최종 폐기 요청 목록:", itemsToDispose);
        
        // 🚨 여기에 실제 폐기 처리 API (POST /stk/disposal/execute) 호출 로직이 들어갑니다.
        alert(`총 ${itemsToDispose.length}개 랏, ${itemsToDispose.reduce((sum, item) => sum + item.disposalQuantity, 0)}개의 제품 폐기를 요청합니다.`);
        // 성공 시 목록 초기화: setDisposalLots([]);
        
        // 페이지 이동 로직이 없으므로, navigate 사용 경고가 발생하지 않습니다.
    };

    const totalDisposalCount = disposalLots.reduce((sum, item) => sum + item.disposalQuantity, 0);

    return (
        <div style={containerStyle}>
            {/* BarcodeListener 통합 */}
            <BarcodeListener onBarcodeScan={processBarcodeScan} /> 
            
            <h2>🗑️ 폐기 등록 및 처리</h2>

            {/* 수동 입력 필드 */}
            <div style={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="제품 바코드를 스캔/수동 입력하세요 (GTIN)"
                    value={scannedGtin}
                    onChange={(e) => setScannedGtin(e.target.value)}
                    style={styles.input}
                />
                <button onClick={handleManualEntry} style={styles.button}>
                    수동 추가
                </button>
            </div>
            
            <h3 style={styles.listTitle}>폐기 예정 목록 ({disposalLots.length}개 랏)</h3>
            
            {/* 폐기 목록 테이블 */}
            <div style={styles.table}>
                <div style={styles.headerRow}>
                    <span style={{...styles.col, flex: 1.5}}>Lot ID</span>
                    <span style={{...styles.col, flex: 3}}>제품명</span>
                    <span style={{...styles.col, flex: 2}}>보관 위치</span>
                    <span style={{...styles.col, flex: 2}}>유통기한</span>
                    <span style={{...styles.col, flex: 1.5}}>총 재고</span>
                    <span style={{...styles.col, flex: 2}}>폐기 수량</span>
                </div>

                {disposalLots.length === 0 ? (
                    <div style={styles.emptyMessage}>바코드를 스캔하여 폐기할 제품을 추가해주세요.</div>
                ) : (
                    disposalLots.map((item) => (
                        <div key={item.lotId} style={styles.dataRow}>
                            <span style={{...styles.col, flex: 1.5, fontWeight: 'bold'}}>{item.lotId}</span>
                            <span style={{...styles.col, flex: 3}}>{item.productName}</span>
                            <span style={{...styles.col, flex: 2}}>{item.location}</span>
                            <span style={{...styles.col, flex: 2}}>{item.expiryDate}</span>
                            <span style={{...styles.col, flex: 1.5, textAlign: 'right'}}>{item.quantity}</span>
                            <span style={{...styles.col, flex: 2, justifyContent: 'center'}}>
                                <input
                                    type="number"
                                    min="0"
                                    max={item.quantity}
                                    value={item.disposalQuantity}
                                    onChange={(e) => handleQuantityChange(item.lotId, e.target.value, item.quantity)}
                                    style={styles.quantityInput}
                                />
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* 최종 폐기 요청 버튼 */}
            <div style={styles.footer}>
                <button 
                    onClick={handleSubmitDisposal} 
                    disabled={totalDisposalCount === 0}
                    style={totalDisposalCount > 0 ? styles.submitButton : styles.disabledButton}
                >
                    선택 항목 폐기 요청 (총 {totalDisposalCount}개)
                </button>
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// ⭐️ 스타일 정의
// ------------------------------------------------------------------

const containerStyle = { padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' };

const styles = {
    inputContainer: { display: 'flex', gap: '10px', marginBottom: '20px' },
    input: { padding: '10px', border: '1px solid #ced4da', borderRadius: '5px', flexGrow: 1, fontSize: '1rem' },
    button: { padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    listTitle: { fontSize: '1.2rem', fontWeight: '600', borderBottom: '2px solid #343a40', paddingBottom: '10px', margin: '15px 0' },
    
    table: { border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' },
    headerRow: { display: 'flex', fontWeight: 'bold', padding: '10px', backgroundColor: '#e9ecef', borderBottom: '1px solid #ced4da' },
    dataRow: { display: 'flex', padding: '10px', borderBottom: '1px dotted #eee', backgroundColor: 'white' },
    col: { padding: '0 5px', alignItems: 'center', display: 'flex' },
    
    emptyMessage: { textAlign: 'center', padding: '30px', color: '#6c757d', backgroundColor: 'white' },
    
    quantityInput: { width: '80px', padding: '5px', textAlign: 'center', border: '1px solid #ced4da', borderRadius: '3px' },
    
    footer: { marginTop: '20px', textAlign: 'right' },
    submitButton: { padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    disabledButton: { padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'not-allowed', fontWeight: 'bold' },
};

export default DisposalEntryView;