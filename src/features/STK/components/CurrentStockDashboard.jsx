import React from 'react';

// STK 관련 컴포넌트들을 import합니다.
// CapacityVisualization 컴포넌트 이름으로 ProgressStatusVisualization을 가져옵니다.
import CapacityVisualization from './ProgressStatusVisualization'; 
import RelocationRequired from './RelocationRequired'; 		 
import StockStatus from './StockStatus'; 		 

// =================================================================
// 1. 적재 용량 현황 Mock Data 정의 (ProgressStatusVisualization에 맞게 구조 조정)
// =================================================================

const CAPACITY_VISUAL_DATA = {
    // 창고 적재 용량 현황
    total: 1000,  // 총 용량 (CBM)
    current: 780, // 사용 중인 용량
    unit: 'CBM',
};


/**
 * 재고 현황 조회 페이지의 메인 대시보드 컴포넌트입니다.
 */
const CurrentStockDashboard = () => {
    // 💡 실제 구현 시에는 이 부분에서 Spring Boot API를 호출하여 데이터를 가져와야 합니다.
    
    return (
        <div style={{ padding: '0px' }}>
            
            {/* 제목 */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 15px 0', color: '#343a40' }}>
                📊 현재 재고 현황 조회
            </h2>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 2fr', 
                gap: '20px', 
                marginTop: '20px' 
            }}>
                
                {/* 👈 좌측 컨테이너 (1fr) */}
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '20px' }}>
                    
                    {/* 1. 적재 용량 시각화 (CapacityVisualization = ProgressStatusVisualization) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        {/* 적재 용량 데이터를 ProgressStatusVisualization(CapacityVisualization)에 전달 */}
                        <CapacityVisualization 
                            title="창고 적재 용량 현황" 
                            data={CAPACITY_VISUAL_DATA} 
                            fillColor="#007bff" // 용량은 파란색으로 지정
                        />
                    </div>

                    {/* 2. 위치 변경 필요 재고 (RelocationRequired) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <RelocationRequired />
                    </div>
                </div>

                {/* 👉 우측 컨테이너 (2fr) */}
                <div className="card shadow-sm" style={cardStyle}>
                    {/* 3. 전체 재고 현황 (StockStatus) */}
                    <StockStatus />
                </div>
            </div>
        </div>
    );
};

const cardStyle = { 
    border: '1px solid #e0e0e0', 
    borderRadius: '8px', 
    padding: '10px 16px', 
    backgroundColor: '#ffffff'
};

export default CurrentStockDashboard;