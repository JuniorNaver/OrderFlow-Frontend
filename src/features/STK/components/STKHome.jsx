// features/STK/components/STKHome.jsx

import React from 'react';

const STKHome = () => {
    return (
        <div 
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 'calc(100vh - 120px)', 
                fontSize: '24px',
                color: '#6c757d'
            }}
        >
            STK 홈 페이지 (현재 재고 현황 대시보드가 인덱스로 설정됨)
        </div>
    );
};

export default STKHome;