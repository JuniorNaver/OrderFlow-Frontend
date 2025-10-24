// src/features/STK/components/DisposalView.jsx

import React, { useState, useCallback, useEffect, useMemo } from 'react'; // ⭐️ useMemo 추가
import BarcodeListener from '../../SD/components/BarcodeListener';
import { fetchStockByGtin, executeDisposal, fetchDisposalList } from '../api/stockApi'; 

// ⭐️ 페이지당 항목 수 상수를 정의합니다.
const ITEMS_PER_PAGE = 15;

/**
 * ⭐️ 바코드 스캔 기반의 폐기 등록/처리 뷰 컴포넌트입니다.
 */
const DisposalView = () => {
    const [scannedGtin, setScannedGtin] = useState('');
    const [disposalLots, setDisposalLots] = useState([]); 
    // ⭐️ 페이지네이션을 위한 현재 페이지 상태를 추가합니다. (기본값: 1)
    const [currentPage, setCurrentPage] = useState(1); 

    // ------------------------------------------------------------------
    // ⭐️ 1. 초기 목록 로드: 컴포넌트 마운트 시 유통기한 만료 재고를 불러옴
    // ------------------------------------------------------------------
    useEffect(() => {
        const loadInitialDisposalList = async () => {
            try {
                // /api/stk/list/expired API 호출 (유통기한 만료된 활성 재고 조회)
                const expiredItems = await fetchDisposalList(); 
                
                // 불러온 만료 목록을 Lot ID를 기준으로 목록에 설정
                setDisposalLots(expiredItems.map(item => ({
                    ...item,
                    disposalQuantity: 0, // 초기 폐기 수량 0 설정
                })));
                // ⭐️ 새 목록 로드 시 페이지 리셋
                setCurrentPage(1); 
            } catch (error) {
                console.error("초기 폐기 목록을 불러오는 데 실패했습니다:", error);
            }
        };

        loadInitialDisposalList();
    }, []); // 컴포넌트 마운트 시 한 번만 실행

    // ------------------------------------------------------------------
    // 2. 페이지네이션 로직 계산
    // ------------------------------------------------------------------
    // 전체 페이지 수를 계산합니다.
    const totalPages = Math.ceil(disposalLots.length / ITEMS_PER_PAGE);

    // 현재 페이지에 표시할 데이터를 계산합니다.
    const paginatedData = useMemo(() => {
        const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
        return disposalLots.slice(indexOfFirstItem, indexOfLastItem);
    }, [disposalLots, currentPage]);
    
    // 페이지 변경 핸들러
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    // ------------------------------------------------------------------
    // 3. 수량 및 바코드 핸들러
    // ------------------------------------------------------------------
    const handleQuantityChange = (lotId, value, maxQuantity) => {
        const newQuantity = Math.max(0, Math.min(parseInt(value) || 0, maxQuantity));
        
        // lotId 기준으로 전체 disposalLots 상태를 업데이트합니다.
        setDisposalLots(prev => 
            prev.map(item => 
                item.lotId === lotId ? { ...item, disposalQuantity: newQuantity } : item
            )
        );
    };

    const processBarcodeScan = useCallback(async (gtinToScan) => {
        if (!gtinToScan) return;
        setScannedGtin(''); 

        try {
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
                    
                const newLots = [...prev, ...filteredNewItems];
                
                // ⭐️ 새 항목 추가 시 목록의 마지막 페이지로 이동 (선택 사항)
                setCurrentPage(Math.ceil(newLots.length / ITEMS_PER_PAGE));
                
                return newLots;
            });

        } catch (error) {
            console.error("재고 조회 중 오류 발생:", error);
            alert("재고 정보를 불러오는 데 실패했습니다.");
        }
    }, []); 

    const handleManualEntry = () => {
        processBarcodeScan(scannedGtin.trim());
    };
    
    // ------------------------------------------------------------------
    // 4. 폐기 실행 로직 (페이징과 무관하게 전체 목록 사용)
    // ------------------------------------------------------------------
    const handleSubmitDisposal = async () => { 
        const itemsToDispose = disposalLots.filter(item => item.disposalQuantity > 0);
        
        if (itemsToDispose.length === 0) {
            alert("폐기할 수량을 1개 이상 입력해주세요.");
            return;
        }

        const requestDTO = {
            items: itemsToDispose.map(item => ({
                lotId: item.lotId,
                productGtin: item.productGtin, 
                quantity: item.disposalQuantity
            }))
        };

        try {
            const updatedStocks = await executeDisposal(requestDTO);
            
            const disposedLotIds = new Set(updatedStocks
                .filter(s => s.quantity === 0) 
                .map(s => s.lotId)); 
            
            // 목록 업데이트: 폐기된 항목 제거 및 잔여 수량 반영
            setDisposalLots(prev => {
                 const newLots = prev.filter(item => !disposedLotIds.has(item.lotId))
                    .map(item => {
                        const updatedItem = updatedStocks.find(s => s.lotId === item.lotId);
                        if (updatedItem) {
                            return { ...item, quantity: updatedItem.quantity, disposalQuantity: 0 };
                        }
                        return item;
                    });
                
                // ⭐️ 데이터가 줄어들어 페이지가 사라질 경우 (예: 2페이지였는데 1페이지가 됨)
                // 현재 페이지를 최대 페이지로 조정합니다.
                const newTotalPages = Math.ceil(newLots.length / ITEMS_PER_PAGE);
                setCurrentPage(prev => Math.min(prev, newTotalPages || 1));
                
                return newLots;
            });

            const totalDisposed = itemsToDispose.reduce((sum, item) => sum + item.disposalQuantity, 0);

            alert(`✅ 폐기 요청이 성공적으로 처리되었습니다. (총 ${totalDisposed}개 폐기)`);
            
        } catch (error) {
            console.error("폐기 처리 중 API 오류 발생:", error);
            alert(`폐기 처리 중 오류가 발생했습니다. 상세: ${error.message}`);
        }
    };

    const totalDisposalCount = disposalLots.reduce((sum, item) => sum + item.disposalQuantity, 0);

    // ------------------------------------------------------------------
    // 5. 렌더링
    // ------------------------------------------------------------------
    return (
        <div style={containerStyle}>
            <BarcodeListener onBarcodeScan={processBarcodeScan} /> 
            
            <h2>🗑️ 폐기 등록 및 처리</h2>

            {/* 바코드 입력 필드 */}
            <div style={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="폐기할 제품 바코드를 스캔/수동 입력하세요 (GTIN)"
                    value={scannedGtin}
                    onChange={(e) => setScannedGtin(e.target.value)}
                    style={styles.input}
                />
                <button onClick={handleManualEntry} style={styles.button}>
                    추가
                </button>
            </div>
            
            <h3 style={styles.listTitle}>폐기 예정 목록 ({disposalLots.length}개 랏)</h3>
            
            {/* 폐기 목록 테이블 */}
            <div style={styles.table}>
                <div style={styles.headerRow}>
                    {/* ⭐️ 헤더: Lot ID, 제품명, 보관 위치, 유통기한, 총 재고, 폐기 수량 */}
                    <span style={{...styles.col, flex: 1.5}}>Lot ID</span>
                    <span style={{...styles.col, flex: 3}}>제품명</span>
                    <span style={{...styles.col, flex: 2}}>보관 위치</span>
                    <span style={{...styles.col, flex: 2}}>유통기한</span>
                    <span style={{...styles.col, flex: 1.5}}>총 재고</span>
                    <span style={{...styles.col, flex: 2}}>폐기 수량</span>
                </div>

                {paginatedData.length === 0 && disposalLots.length === 0 ? (
                    <div style={styles.emptyMessage}>폐기할 항목이 없습니다. (유통기한 만료 또는 수동 스캔)</div>
                ) : (
                    // ⭐️ paginatedData를 렌더링합니다.
                    paginatedData.map((item) => (
                        <div key={item.lotId} style={styles.dataRow}>
                            {/* ⭐️ 데이터 열 */}
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
                                    // ⭐️ lotId를 사용하여 전체 목록(disposalLots)에서 해당 항목을 정확히 찾아 업데이트합니다.
                                    onChange={(e) => handleQuantityChange(item.lotId, e.target.value, item.quantity)}
                                    style={styles.quantityInput}
                                />
                            </span>
                        </div>
                    ))
                )}
            </div>

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
// ⭐️ 스타일 정의 (페이징 스타일 추가)
// ------------------------------------------------------------------

const containerStyle = { padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' };

const styles = {
    inputContainer: { display: 'flex', gap: '10px', marginBottom: '20px' },
    input: { padding: '10px', border: '1px solid #ced4da', borderRadius: '5px', flexGrow: 1, fontSize: '1rem' },
    button: { padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
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

    // ⭐️ 페이지네이션 스타일 추가
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

export default DisposalView;
