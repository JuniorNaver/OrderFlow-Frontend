import React from 'react';

// 스타일은 그대로 유지합니다.
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
        backgroundColor: '#007bff', 
        transition: 'width 0.5s ease-in-out',
        borderRadius: '5px 0 0 5px',
    }
};

/**
 * [재사용] 진행률 바 형태로 현황을 시각화하는 범용 컴포넌트입니다.
 * 적재 용량(used/total) 또는 유통기한(expired/total) 현황에 모두 사용 가능합니다.
 * * @param {object} props.data - 현황 데이터를 담은 객체
 * @param {string} props.title - 카드의 제목
 * @param {number} props.data.total - 전체 기준 값
 * @param {number} props.data.current - 현재 사용/도달 값
 * @param {string} props.data.unit - 데이터 단위 (CBM, 개 등)
 * @param {string} props.fillColor - 진행률 바의 색상 (선택 사항)
 */
const ProgressStatusVisualization = ({ title, data, fillColor = '#007bff' }) => {
    // data가 유효한지 확인
    if (!data || typeof data.total !== 'number' || typeof data.current !== 'number') {
        return <div style={{ color: '#dc3545' }}>유효하지 않은 데이터 형식입니다.</div>;
    }

    // 데이터 계산
    const utilization = (data.current / data.total) * 100;
    const remaining = data.total - data.current;
    const barWidth = `${Math.min(utilization, 100)}%`; // 100% 초과 방지
    const currentLabel = title.includes('용량') ? '사용률' : '비율'; // 제목에 따라 레이블 변경

    return (
        <div style={{ padding: '5px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '15px', color: '#343a40' }}>
                {title}
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1rem', fontWeight: '500' }}>
                <span>{currentLabel}: {utilization.toFixed(1)}%</span>
                <span>잔여: {remaining.toLocaleString()} {data.unit}</span>
            </div>

            {/* 용량 시각화 바 */}
            <div style={styles.barContainer}>
                <div style={{ ...styles.barFill, width: barWidth, backgroundColor: fillColor }}></div>
            </div>

            <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#6c757d' }}>
                <p>총 {data.unit}: {data.total.toLocaleString()} {data.unit}</p>
                <p>{title.includes('용량') ? '사용 중' : '현재 수량'}: {data.current.toLocaleString()} {data.unit}</p>
            </div>
        </div>
    );
};

// 원본 파일명을 유지하여 Export
export default ProgressStatusVisualization;