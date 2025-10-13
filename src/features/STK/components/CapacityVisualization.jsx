// features/STK/components/CapacityVisualization.jsx

import React from 'react';

/**
 * [임시] 창고 적재 용량 시각화 컴포넌트입니다.
 * 재고 현황 대시보드의 핵심 위젯으로 사용됩니다.
 */
const CapacityVisualization = () => {
    // 실제 데이터는 API 호출을 통해 가져오거나 전역 상태에서 관리됩니다.
    const DUMMY_CAPACITY = {
        total: 1000, // 전체 용량 (CBM 또는 팔레트 수)
        used: 780,   // 사용 중인 용량
        unit: 'CBM'  // 단위
    };
    
    const utilization = (DUMMY_CAPACITY.used / DUMMY_CAPACITY.total) * 100;
    const remaining = DUMMY_CAPACITY.total - DUMMY_CAPACITY.used;
    const barWidth = `${utilization}%`;

    return (
        <div style={{ padding: '5px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '15px', color: '#343a40' }}>
                창고 적재 용량 현황
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1rem', fontWeight: '500' }}>
                <span>사용률: {utilization.toFixed(1)}%</span>
                <span>잔여: {remaining.toLocaleString()} {DUMMY_CAPACITY.unit}</span>
            </div>

            {/* 용량 시각화 바 */}
            <div style={styles.barContainer}>
                <div style={{ ...styles.barFill, width: barWidth }}></div>
            </div>

            <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#6c757d' }}>
                <p>총 용량: {DUMMY_CAPACITY.total.toLocaleString()} {DUMMY_CAPACITY.unit}</p>
                <p>사용 중: {DUMMY_CAPACITY.used.toLocaleString()} {DUMMY_CAPACITY.unit}</p>
            </div>
        </div>
    );
};

const styles = {
    barContainer: {
        height: '25px',
        backgroundColor: '#e9ecef',
        borderRadius: '5px',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
    },
    barFill: {
        height: '100%',
        backgroundColor: '#007bff', // Bootstrap Primary Color
        transition: 'width 0.5s ease-in-out',
        borderRadius: '5px 0 0 5px',
    }
};

export default CapacityVisualization;