import React, { useState, useEffect } from 'react';
// ⭐️ 1. API 서비스 함수 임포트
// import { fetchWarehouseCapacityStatus } from '../../api/InventoryService'; // 실제 경로로 변경
const fetchWarehouseCapacityStatus = () => {
    // ⭐️ API 연결 없이 시연을 위한 가짜 데이터 반환
    return new Promise(resolve => 
        setTimeout(() => {
            resolve({
                total: 5000,
                current: 1250,
                unit: 'CBM'
            });
        }, 1000)
    );
};

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
 * * ⭐️ 주요 수정 사항: data prop이 선택 사항이 되었으며, 
 * `apiEndpoint` prop을 받아 내부적으로 데이터를 가져옵니다.
 *
 * @param {object} props.data - (선택 사항) 외부에서 주입되는 현황 데이터
 * @param {string} props.apiEndpoint - (선택 사항) 데이터를 가져올 API 경로 (예: 'inventory/capacity/status')
 * @param {string} props.title - 카드의 제목
 * @param {string} props.fillColor - 진행률 바의 색상 (선택 사항)
 */
const ProgressStatusVisualization = ({ title, data: initialData, apiEndpoint, fillColor = '#007bff' }) => {
    // ⭐️ 2. API 데이터를 관리할 상태 추가
    const [localData, setLocalData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(!initialData && !!apiEndpoint);
    const [error, setError] = useState(null);

    // ⭐️ 3. API 호출 로직 (컴포넌트가 마운트될 때 한 번 실행)
    useEffect(() => {
        if (apiEndpoint && !initialData) {
            const fetchData = async () => {
                try {
                    // 🚨 이 부분은 실제 API 함수(예: fetchWarehouseCapacityStatus)로 대체해야 합니다.
                    // 임시로 가짜 데이터를 사용했습니다.
                    const fetchedData = await fetchWarehouseCapacityStatus(); 
                    setLocalData(fetchedData);
                    setError(null);
                } catch (e) {
                    setError('데이터를 불러오는 데 실패했습니다.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        } else if (initialData) {
            setLocalData(initialData);
            setIsLoading(false);
        }
    }, [apiEndpoint, initialData]);

    // 사용될 데이터 결정
    const data = localData;

    // 로딩 및 에러 처리
    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>데이터 로딩 중...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: '#dc3545' }}>❌ {error}</div>;
    }

    if (!data || typeof data.total !== 'number' || typeof data.current !== 'number') {
        return <div style={{ color: '#dc3545' }}>유효하지 않은 데이터 형식입니다.</div>;
    }

    // 데이터 계산 (기존 로직 유지)
    const utilization = (data.current / data.total) * 100;
    const remaining = data.total - data.current;
    const barWidth = `${Math.min(utilization, 100)}%`; 
    const currentLabel = title.includes('용량') ? '사용률' : '비율'; 

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
                <div 
                    style={{ 
                        ...styles.barFill, 
                        width: barWidth, 
                        backgroundColor: fillColor 
                    }}
                ></div>
            </div>

            <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#6c757d' }}>
                <p>총 {data.unit}: {data.total.toLocaleString()} {data.unit}</p>
                <p>{title.includes('용량') ? '사용 중' : '현재 수량'}: {data.current.toLocaleString()} {data.unit}</p>
            </div>
        </div>
    );
};

export default ProgressStatusVisualization;