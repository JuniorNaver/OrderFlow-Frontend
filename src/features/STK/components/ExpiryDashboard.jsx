import React, { useState, useEffect } from 'react';
import ProgressStatusVisualization from './ProgressStatusVisualization'; 
import { fetchCapacityStatus, fetchExpiryStatus } from '../api/stockApi'; // 👈 API import


/**
 * 유통기한 현황 페이지의 메인 대시보드 컴포넌트입니다.
 */
const ExpiryDashboard = () => {
    const [capacityData, setCapacityData] = useState(null);
    const [expiryData, setExpiryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [capData, expData] = await Promise.all([
                    fetchCapacityStatus(), // 적재 용량
                    fetchExpiryStatus(90)  // 유통기한 현황 (90일 기준)
                ]);
                setCapacityData(capData);
                setExpiryData(expData);
            } catch (error) {
                console.error("유통기한 대시보드 데이터를 불러오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading) {
        return <div style={{ padding: '20px' }}>대시보드 데이터 로딩 중...</div>;
    }
    
    // 데이터가 없으면 로딩 실패 메시지 표시
    if (!capacityData || !expiryData) {
        return <div style={{ padding: '20px' }}>필수 데이터를 불러오지 못했습니다.</div>;
    }

    return (
        <div style={{ padding: '0px' }}>
            {/* 제목 */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 15px 0', color: '#343a40' }}>
                ⏳ 유통기한 현황
            </h2>
            
            {/* ⭐️ 대시보드 레이아웃 (Grid) 적용 */}
            <div style={dashboardLayout}> 
                
                {/* 👈 좌측 컨테이너 (1fr, Grid Rows) */}
                <div style={containerLayout}>
                    
                    {/* 1. 적재 용량 시각화 */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <ProgressStatusVisualization 
                            title="창고 적재 용량 현황" 
                            data={capacityData} // 👈 상태 데이터 사용
                            fillColor="#007bff" 
                        />
                    </div>

                    {/* 2. 발주 필요 재고 (임시 텍스트) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <div style={contentStyle}>발주 필요 재고 (PurchaseRequired) 영역</div>
                    </div>
                </div>

                {/* 👉 우측 컨테이너 (1fr, Grid Rows) */}
                <div style={containerLayout}>
                    
                    {/* 3. 유통기한 임박 재고 */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <ProgressStatusVisualization 
                            title="유통기한 임박 재고 현황 (90일 이내)" 
                            data={expiryData} // 👈 상태 데이터 사용
                            fillColor="#dc3545" 
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

// ------------------------------------------------------------------
// ⭐️ 스타일 정의 (레이아웃 스타일 추가)
// ------------------------------------------------------------------

const dashboardLayout = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // 두 개의 동일한 너비 열
    gap: '20px',
    marginTop: '20px'
};

const containerLayout = {
    display: 'grid',
    gridTemplateRows: '1fr 1fr', // 두 개의 동일한 높이 행
    gap: '20px',
};

const cardStyle = { 
    border: '1px solid #e0e0e0', 
    borderRadius: '8px', 
    padding: '16px', 
    backgroundColor: '#ffffff',
    height: '100%', // 컨테이너 높이에 맞춤
    boxSizing: 'border-box',
};

const contentStyle = {
    textAlign: 'center',
    padding: '30px',
    color: '#6c757d'
};

export default ExpiryDashboard;