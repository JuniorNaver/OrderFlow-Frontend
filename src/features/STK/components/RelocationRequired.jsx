import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        paddingBottom: '8px',
        marginBottom: '10px',
        borderBottom: '1px solid #f0f0f0',
    }
};

// 위치 변경 필요 재고 목록 컴포넌트 (더미 유지)
const RelocationRequired = () => {
    const navigate = useNavigate(); 

    const items = [
        { name: '제품 A-1234', stock: '100개', expiry: '2025-10-30', location: '실온 F1', reason: '온도 오류' },
        { name: '제품 B-5678', stock: '50개', expiry: '2025-11-15', location: '냉동 G3', reason: '파손 위험' },
        { name: '제품 C-9012', stock: '20개', expiry: '2025-12-01', location: '냉장 H2', reason: '재고 이동' },
    ];

    // 클릭 핸들러: 절대 경로로 이동하도록 설정하여 경로 반복 방지
    const handleItemClick = (item) => {
        // 절대 경로로 이동 활성화
        navigate('/stk/relocation-details');
        console.log(`[STK] ${item.name}의 위치 변경 상세 페이지로 이동합니다. (경로: /stk/relocation-details)`);
    };
    
    return (
        <div style={{ padding: '16px' }}>
            <h3 style={styles.sectionTitle}>위치 변경 필요 재고 (3건)</h3>
            <div style={{ fontSize: '0.85rem', color: '#777', padding: '5px 0', borderBottom: '1px solid #eee', display: 'flex' }}>
                <span style={{ flex: 2 }}>품목명</span>
                <span style={{ flex: 1 }}>현 위치</span>
                <span style={{ flex: 1 }}>사유</span>
                <span style={{ flex: 1, textAlign: 'right' }}>재고</span>
            </div>
            {items.map((item) => ( 
                <div 
                    key={item.name} 
                    style={{ 
                        display: 'flex', 
                        padding: '10px 0', 
                        borderBottom: '1px dotted #ccc', 
                        fontSize: '0.9rem', 
                        alignItems: 'center',
                        cursor: 'pointer', // 클릭 가능하도록 커서 추가
                    }}
                    onClick={() => handleItemClick(item)} 
                >
                    <span style={{ flex: 2, fontWeight: '500' }}>{item.name}</span>
                    <span style={{ flex: 1, color: '#f97316' }}>{item.location}</span>
                    <span style={{ flex: 1, color: '#ef4444' }}>{item.reason}</span>
                    <span style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{item.stock}</span>
                </div>
            ))}
        </div>
    );
};

export default RelocationRequired;
