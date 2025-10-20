// src/features/STK/components/DisposalList.jsx

import React, { useState, useEffect } from 'react';
import { fetchDisposalList } from '../api/stockApi'; // ⭐️ 이제 사용됨
import { useNavigate } from 'react-router-dom';

/**
 * 유통기한 만료 재고 목록을 표시하고, 폐기 수량을 입력받는 컴포넌트입니다.
 */
const DisposalList = () => {
    // disposalData: API로 불러온 재고 정보와 사용자가 입력한 quantity를 담는 상태
    const [disposalData, setDisposalData] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                // ⭐️ 실제 API 호출: /stk/list/expired 엔드포인트 사용
                const rawData = await fetchDisposalList(); 
                
                // API 응답 데이터 (rawData)를 기반으로 초기 폐기 수량(quantity)을 재고 수량(stock 또는 quantity 필드)으로 설정
                const initialData = rawData.map(item => ({ 
                    ...item, 
                    // API 응답이 'quantity' 필드를 가진다고 가정하고, 이를 stock으로 사용
                    stock: item.quantity, 
                    quantity: item.quantity || 0 // 폐기 수량 초기화 (기본값: 전량)
                }));

                setDisposalData(initialData);
            } catch (error) {
                console.error("폐기 목록 데이터를 불러오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // 핸들러: 수량 입력 변경 시 상태 업데이트
    const handleQuantityChange = (index, value) => {
        const item = disposalData[index];
        const maxStock = item.stock || item.quantity; // stock 필드가 없다면 quantity 필드를 사용
        const newQuantity = Math.max(0, Math.min(parseInt(value) || 0, maxStock));
        
        setDisposalData(prevData => 
            prevData.map((dataItem, i) => 
                i === index ? { ...dataItem, quantity: newQuantity } : dataItem
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

        // ⭐️ 경로를 '/stk/adjustment/disposal'에서 '/stk/disposal'로 변경하여 라우팅 오류를 회피합니다.
        // (App.jsx의 라우팅 정의와 일치하도록 수정이 필요)
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

            {disposalData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>유통기한 만료된 폐기 대상 제품이 없습니다.</div>
            ) : (
                disposalData.map((item, index) => (
                    // API 응답에 Lot ID가 없으므로 index를 key로 사용 (경고 방지)
                    <div key={item.lotId || index} style={styles.itemRow}>
                        <span style={{ ...styles.col, flex: 0.5 }}>{index + 1}</span>
                        <div style={{ ...styles.col, flex: 3, padding: '0 10px' }}>
                            <div style={styles.productName}>{item.productName || item.name}</div>
                        </div>
                        <span style={{ ...styles.col, flex: 1.5, textAlign: 'right', justifyContent: 'flex-end' }}>
                            {item.expiryDate || 'N/A'}
                        </span>
                        
                        {/* 폐기 수량 입력 필드 */}
                        <div style={{ ...styles.col, flex: 2, display: 'flex', justifyContent: 'center' }}>
                            <input type="number" 
                                value={item.quantity} 
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
                ))
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
// 스타일 정의 (이전과 동일)
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
    }
};

export default DisposalList;