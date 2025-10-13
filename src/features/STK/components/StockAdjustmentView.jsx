// features/STK/components/StockAdjustmentView.jsx

import React from 'react';

/**
 * [임시] 재고 수량 조정 페이지 컴포넌트입니다.
 * '/stk/adjust' 경로에 매칭됩니다.
 */
const StockAdjustmentView = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: '#ffffff', minHeight: '80vh', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#17a2b8', borderBottom: '2px solid #17a2b8', paddingBottom: '10px', marginBottom: '20px' }}>
                ⚙️ 재고 수량 조정
            </h2>
            
            <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                여기는 실사 결과나 분실 등으로 인한 재고 수량 차이를 조정하는 페이지입니다.
            </p>
            
            <div style={contentStyle}>
                <p>조정 사유 선택, 품목 검색, 수량 입력 필드 등의 기능이 구현될 예정입니다.</p>
            </div>
        </div>
    );
};

const contentStyle = {
    marginTop: '50px',
    padding: '30px',
    border: '1px dashed #ced4da',
    borderRadius: '4px',
    textAlign: 'center',
    backgroundColor: '#f8f9fa'
};

export default StockAdjustmentView;