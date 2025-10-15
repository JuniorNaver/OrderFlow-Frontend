import React from 'react';

// 재사용 가능한 스타일 정의 (ExpiryDashboard에서 가져옴)
const cardContentStyle = { 
    padding: '5px',
    // 이 외의 필요한 공통 스타일을 여기에 추가
};

const valueStyle = { 
    fontSize: '2.5rem', 
    fontWeight: 'bold', 
    color: '#007bff', 
    margin: '10px 0' 
};

/**
 * [재사용] 적재 용량, 유통기한 등 다양한 현황 데이터를 표시하는 카드 콘텐츠 컴포넌트입니다.
 * * @param {object} props.data - 현황 데이터를 담은 객체
 * @param {string} props.data.title - 카드의 제목 (예: '유통기한 임박 현황', '창고A 용량')
 * @param {number} props.data.total - 총합 값
 * @param {array} props.data.items - 세부 항목 리스트
 */
const StatusCardContent = ({ data }) => {
    // data가 없으면 로딩 또는 빈 상태를 표시할 수 있습니다.
    if (!data || !data.items) {
        return <div style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>데이터를 불러오는 중입니다...</div>;
    }

    // items 배열의 첫 번째 항목에서 단위(unit)를 가져와 총합에 사용
    const unit = data.items.length > 0 ? data.items[0].unit : ''; 

    return (
        <div style={cardContentStyle}>
            <h4 style={{ margin: '0 0 15px 0', color: '#343a40' }}>{data.title}</h4>
            <p style={valueStyle}>
                총 {data.total} {unit}
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {data.items.map((item, index) => (
                    <li key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '5px 0',
                        fontSize: '0.95rem'
                    }}>
                        <span style={{ color: item.color || '#333', fontWeight: '600' }}>{item.label}</span>
                        <span>{item.value} {item.unit}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StatusCardContent;