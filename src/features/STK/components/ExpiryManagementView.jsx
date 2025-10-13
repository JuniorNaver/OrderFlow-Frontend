// features/STK/components/ExpiryManagementView.jsx

import React from 'react';

/**
 * [임시] 유통기한 임박 상품 관리 페이지 컴포넌트입니다.
 * '/stk/expiry-manage' 경로에 매칭됩니다.
 */
const ExpiryManagementView = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: '#ffffff', minHeight: '80vh', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc3545', borderBottom: '2px solid #dc3545', paddingBottom: '10px', marginBottom: '20px' }}>
                ⚠️ 유통기한 임박 상품 관리
            </h2>
            
            <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                여기는 유통기한이 임박한 상품을 조회하고, 폐기/출고 처리 등을 관리하는 상세 페이지입니다.
            </p>
            
            <div style={contentStyle}>
                <p>상품 목록, 유통기한 필터링, 처리 버튼 등의 기능이 구현될 예정입니다.</p>
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

export default ExpiryManagementView;