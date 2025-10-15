import React, { useState, useEffect } from 'react';
// CapacityVisualization 대신 ProgressStatusVisualization으로 이름을 통일합니다.
import ProgressStatusVisualization from './ProgressStatusVisualization'; 
import RelocationRequired from './RelocationRequired';
import StockStatus from './StockStatus';
// API import 경로는 현재 컴포넌트의 상대적 위치에 따라 유효하다고 가정합니다.
import { fetchCapacityStatus } from '../api/stockApi'; 


/**
 * 재고 현황 조회 페이지의 메인 대시보드 컴포넌트입니다.
 */
const CurrentStockDashboard = () => {
    const [capacityData, setCapacityData] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // API 호출
                const data = await fetchCapacityStatus(); 
                setCapacityData(data);
            } catch (error) {
                console.error("용량 현황 데이터를 불러오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // 로딩 처리
    if (isLoading) {
        return <div style={{ padding: '20px' }}>데이터 로딩 중...</div>;
    }
    
    // 데이터가 없으면 빈 화면 또는 에러 메시지 표시
    if (!capacityData) {
        return <div style={{ padding: '20px' }}>용량 현황 데이터를 찾을 수 없습니다.</div>;
    }
    
    return (
        <div style={{ padding: '0px' }}>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 15px 0', color: '#343a40' }}>
                📊 현재 재고 현황 조회
            </h2>
            
            {/* ⭐️ 레이아웃 스타일 적용 */}
            <div style={dashboardLayout}> 
                
                {/* 👈 좌측 컨테이너 (1fr, Grid) */}
                <div style={leftContainerLayout}>
                    
                    {/* 1. 적재 용량 시각화 */}
                    <div className="card shadow-sm" style={cardStyle}>
                        {/* ⭐️ ProgressStatusVisualization 사용 */}
                        <ProgressStatusVisualization 
                            title="창고 적재 용량 현황" 
                            data={capacityData} 
                            fillColor="#007bff" 
                        />
                    </div>

                    {/* 2. 위치 변경 필요 재고 */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <RelocationRequired />
                    </div>
                </div>

                {/* 👉 우측 컨테이너 (2fr) */}
                {/* 우측 컨테이너가 2개의 행을 모두 차지하도록 스타일 적용 */}
                <div className="card shadow-sm" style={{ 
                    ...cardStyle, 
                    gridColumn: '2 / 3', 
                    gridRow: '1 / 3',
                    minHeight: '400px' // 최소 높이 보장 (옵션)
                }}> 
                    {/* 3. 전체 재고 현황 */}
                    <StockStatus />
                </div>
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// ⭐️ 스타일 정의
// ------------------------------------------------------------------

const dashboardLayout = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr', // 좌측 1, 우측 2의 비율
    gap: '20px',
    marginTop: '20px'
};

const leftContainerLayout = {
    display: 'grid',
    gridTemplateRows: 'auto auto', // 컨텐츠 높이에 맞게 자동 조정
    gap: '20px',
};


const cardStyle = { 
    border: '1px solid #e0e0e0', 
    borderRadius: '8px', 
    padding: '10px 16px', 
    backgroundColor: '#ffffff',
    height: '100%', 
    boxSizing: 'border-box',
};

export default CurrentStockDashboard;