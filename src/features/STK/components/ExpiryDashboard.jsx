// features/STK/components/ExpiryDashboard.jsx

import React from 'react';
// CurrentTimeDisplay import 제거

/**
 * [임시] 유통기한 현황 페이지의 메인 대시보드 컴포넌트입니다.
 */
const ExpiryDashboard = () => {
    return (
        <div style={{ padding: '0px' }}>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 15px 0', color: '#343a40' }}>
                ⏳ 유통기한 현황
            </h2>
            
            {/* CurrentTimeDisplay 렌더링 코드 제거 */}

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px', 
                marginTop: '20px' 
            }}>
                
                {/* 👈 좌측 컨테이너 (적재 용량 및 발주 필요) */}
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '20px' }}>
                    
                    {/* 1. 적재 용량 시각화 (임시 텍스트) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        {/* <CapacityVisualization /> 를 여기에 사용합니다. */}
                        <div style={contentStyle}>적재 용량 시각화 (CapacityVisualization) 영역</div>
                    </div>

                    {/* 2. 발주 필요 재고 (임시 텍스트) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <div style={contentStyle}>발주 필요 재고 (PurchaseRequired) 영역</div>
                    </div>
                </div>

                {/* 👉 우측 컨테이너 (유통기한 임박 및 폐기 예정) */}
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '20px' }}>
                    
                    {/* 3. 유통기한 임박 재고 (임시 텍스트) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <div style={contentStyle}>유통기한 임박 재고 (ExpirationDateStatus) 영역</div>
                    </div>

                    {/* 4. 폐기 예정 재고 (임시 텍스트) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <div style={contentStyle}>폐기 예정 재고 (DisposalScheduled) 영역</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 재사용 가능한 스타일 정의
const cardStyle = { 
    border: '1px solid #e0e0e0', 
    borderRadius: '8px', 
    padding: '16px', 
    backgroundColor: '#ffffff'
};

const contentStyle = {
    textAlign: 'center',
    padding: '30px',
    color: '#6c757d'
};

export default ExpiryDashboard;