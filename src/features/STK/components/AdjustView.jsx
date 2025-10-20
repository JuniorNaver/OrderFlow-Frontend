// src/features/STK/components/AdjustView.jsx

import React, { useState, useEffect } from 'react'; 
import { fetchAdjustmentList, executeStockAdjustment } from '../api/stockApi'; 
// import styles from './styles'; // 스타일 파일 임포트 또는 인라인 스타일 사용

const AdjustView = () => {
    const [adjustmentLots, setAdjustmentLots] = useState([]);
    
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
            } catch (error) {
                console.error("조정 목록을 불러오는 데 실패했습니다:", error);
            }
        };
        loadAdjustmentList();
    }, []);

    // ⭐️ 2. 조정 수량 변경 핸들러
    const handleQuantityChange = (lotId, value) => {
        const quantity = parseInt(value) || 0; 
        
        setAdjustmentLots(prev => 
            prev.map(item => 
                item.lotId === lotId ? { ...item, newQuantity: quantity } : item
            )
        );
    };

    // ⭐️ 3. 최종 조정 요청 핸들러
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
            setAdjustmentLots(prev => 
                prev.filter(item => {
                    const adjustedItem = itemsToAdjust.find(a => a.lotId === item.lotId);
                    // 조정 후 수량이 0보다 커져서 더 이상 조정 대상이 아닐 경우 리스트에서 제거
                    return !(adjustedItem && adjustedItem.newQuantity > 0); 
                })
            );
            
        } catch (error) {
            console.error("재고 조정 중 API 오류 발생:", error);
            alert("재고 조정 중 오류가 발생했습니다.");
        }
    };
    
    // ... (렌더링 부분)
    return (
        <div style={/* containerStyle */ {padding: '20px'}}>
            <h2>📊 재고 수량 조정 (FIFO 오류/수량 불일치)</h2>
            <p>FIFO 위반, 수량 불일치(0 이하) 등의 사유로 조정이 필요한 랏 목록입니다. *재고 조사 결과에 따라 정확한 수량을 입력하세요.</p>
            
            <h3 style={/* listTitle style */ {borderBottom: '2px solid #343a40', paddingBottom: '10px'}}>조정 대상 목록 ({adjustmentLots.length}개 랏)</h3>
            
            {/* 테이블 헤더 */}
            <div style={/* headerRow style */ {display: 'flex', fontWeight: 'bold'}}>
                <span style={{flex: 1.5}}>Lot ID</span>
                <span style={{flex: 3}}>제품명</span>
                <span style={{flex: 1.5}}>보관 위치</span>
                <span style={{flex: 1.5}}>유통기한</span>
                <span style={{flex: 1.5}}>현재 수량</span>
                <span style={{flex: 2}}>**조정할 수량 입력**</span>
            </div>

            {/* 테이블 데이터 */}
            {adjustmentLots.map((item) => (
                <div key={item.lotId} style={{display: 'flex', borderBottom: '1px dotted #eee'}}>
                    <span style={{flex: 1.5}}>{item.lotId}</span>
                    <span style={{flex: 3}}>{item.productName}</span>
                    <span style={{flex: 1.5}}>{item.location}</span>
                    <span style={{flex: 1.5}}>{item.expiryDate}</span>
                    <span style={{flex: 1.5, color: item.quantity <= 0 ? 'red' : 'inherit'}}>{item.quantity}</span>
                    <span style={{flex: 2}}>
                        <input
                            type="number"
                            value={item.newQuantity}
                            onChange={(e) => handleQuantityChange(item.lotId, e.target.value)}
                            style={{width: '100px', padding: '5px', textAlign: 'center'}}
                        />
                    </span>
                </div>
            ))}
            
            <div style={{marginTop: '20px', textAlign: 'right'}}>
                <button onClick={handleSubmitAdjustment} style={{padding: '10px 20px', backgroundColor: '#007bff', color: 'white'}}>
                    선택 항목 재고 조정 요청
                </button>
            </div>
        </div>
    );
};

export default AdjustView;