import React, { useState, useEffect } from 'react';
import ProgressStatusVisualization from './ProgressStatusVisualization'; 
import DisposalList from './DisposalList'; // 👈 ⭐️ DisposalList 컴포넌트 import
import { fetchCapacityStatus, fetchExpiryStatus } from '../api/stockApi'; 


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
                // 적재 용량 (BI 연동 예정) 및 유통기한 현황 데이터 동시 로드
                const [capData, expData] = await Promise.all([
                    fetchCapacityStatus(), 
                    fetchExpiryStatus(90) // 90일 기준
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
    
    // 데이터가 없으면 로딩 실패 메시지 표시 (Mock이 아닌 실제 API 사용 시)
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
                
                {/* 👈 좌측 컨테이너 (창고 용량 & 발주) */}
                <div style={containerLayout}>
                    
                    {/* 1. 적재 용량 시각화 */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <ProgressStatusVisualization 
                            title="창고 적재 용량 현황" 
                            data={capacityData} 
                            fillColor="#007bff" 
                        />
                    </div>

                    {/* 2. 발주 필요 재고 (BI 연동 예정) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <div style={contentStyle}>발주 필요 재고 (PurchaseRequired) 영역 (BI 연동 예정)</div>
                    </div>
                </div>

                {/* 👉 우측 컨테이너 (유통기한 임박 & 폐기 예정) */}
                <div style={containerLayout}>
                    
                    {/* 3. 유통기한 임박 재고 */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <ProgressStatusVisualization 
                            title="유통기한 임박 재고 현황 (90일 이내)" 
                            data={expiryData} 
                            fillColor="#dc3545" 
                        />
                    </div>

                    {/* 4. ⭐️ 폐기 예정 재고 (DisposalList 컴포넌트 통합) */}
                    <div className="card shadow-sm" style={cardStyle}>
                        <DisposalList /> {/* 👈 구현된 폐기 목록 컴포넌트 삽입 */}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// ⭐️ 스타일 정의 (레이아웃 스타일)
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
    height: '100%', 
    boxSizing: 'border-box',
    // ⭐️ DisposalList는 자체적으로 스타일을 가지므로, overflow hidden으로 레이아웃 안정화
    overflow: 'hidden' 
};

const contentStyle = {
    textAlign: 'center',
    padding: '30px',
    color: '#6c757d'
};

export default ExpiryDashboard;