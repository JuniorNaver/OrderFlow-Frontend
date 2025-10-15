import React from 'react';
import ProgressStatusVisualization from './ProgressStatusVisualization'; 




// =================================================================
// 1. 유통기한 현황 Mock Data 정의 (ProgressStatusVisualization에 맞게 구조 조정)
// =================================================================

const EXPIRY_VISUAL_DATA = {
    // 유통기한 임박 현황
    total: 5000, 
    current: 1275, 
    unit: '개',
};

// 2. 적재 용량 현황 Mock Data 정의 (1번 영역에 사용될 데이터)
const CAPACITY_VISUAL_DATA = {
    // 창고 적재 용량 현황
    total: 1000,  // 총 용량 (CBM)
    current: 780, // 사용 중인 용량
    unit: 'CBM',
};


/**
 * [임시] 유통기한 현황 페이지의 메인 대시보드 컴포넌트입니다.
 */
const ExpiryDashboard = () => {
    // 💡 실제 구현 시에는 이 부분에서 Spring Boot API를 호출하여 데이터를 가져와야 합니다.
    
    return (
        <div style={{ padding: '0px' }}>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 15px 0', color: '#343a40' }}>
                ⏳ 유통기한 현황
            </h2>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px', 
                marginTop: '20px' 
            }}>
                
                {/* 👈 좌측 컨테이너 (적재 용량 및 발주 필요) */}
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '20px' }}>
                    
                    {/* 1. 적재 용량 시각화 (ProgressStatusVisualization으로 재사용) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        {/* 👈 ProgressStatusVisualization 컴포넌트 사용 */}
                        <ProgressStatusVisualization 
                            title="창고 적재 용량 현황" 
                            data={CAPACITY_VISUAL_DATA} 
                            fillColor="#007bff" // 용량은 파란색으로 지정
                        />
                    </div>

                    {/* 2. 발주 필요 재고 (임시 텍스트) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <div style={contentStyle}>발주 필요 재고 (PurchaseRequired) 영역</div>
                    </div>
                </div>

                {/* 👉 우측 컨테이너 (유통기한 임박 및 폐기 예정) */}
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '20px' }}>
                    
                    {/* 3. 유통기한 임박 재고 (ProgressStatusVisualization으로 재사용) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        {/* 👈 ProgressStatusVisualization 컴포넌트 사용 */}
                        <ProgressStatusVisualization 
                            title="유통기한 임박 재고 현황 (90일 이내)" 
                            data={EXPIRY_VISUAL_DATA} 
                            fillColor="#dc3545" // 유통기한은 경고색으로 지정
                        />
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

// 재사용 가능한 스타일 정의 (변동 없음)
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