import React from 'react';
import { useQuery } from '@tanstack/react-query';

// ----------------------------------------------------
// 임시 API 함수: 유통기한 대시보드 데이터
const fetchExpiryDashboardData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500)); 
  return {
    expiringSoon: 15, // 30일 이내 임박 상품 품목 수
    expired: 3,       // 만료된 상품 품목 수
    lowStock: 12,     // 발주 필요 재고 품목 수 (유통기한과 관련하여 연관 지어 표시)
    disposalRequired: 7, // 금주 폐기 예정 수량
    recentDisposals: [ // 최근 폐기 이력
      { id: 1, name: '유기농 우유 1L', quantity: 50, date: '2025-05-10', reason: '유통기한 만료' },
      { id: 2, name: '냉동 만두 (고기)', quantity: 30, date: '2025-05-08', reason: '파손 및 변질' },
    ],
  };
};

const styles = {
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '30px',
  },
  card: (color) => ({
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    textAlign: 'center',
    borderLeft: `5px solid ${color}`,
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  }),
  value: (color) => ({
    fontSize: '2.2rem',
    fontWeight: 'bolder',
    margin: '10px 0',
    color: color,
  }),
  title: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '600',
  },
  listTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    padding: '16px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f9fafb',
    borderRadius: '8px 8px 0 0',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px dotted #e5e7eb',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.1s',
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
};

// ----------------------------------------------------
// 메인 ExpiryDashboard 컴포넌트
const ExpiryDashboard = () => {
  // useQuery 훅은 react-query 라이브러리가 필요합니다.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['expiryDashboardData'],
    queryFn: fetchExpiryDashboardData,
  });

  if (isLoading) return <div style={{ padding: '50px', textAlign: 'center', fontSize: '1.2rem', color: '#6b7280' }}>데이터 로딩 중...</div>;
  if (isError) return <div style={{ padding: '50px', color: '#dc2626', textAlign: 'center', fontSize: '1.2rem' }}>데이터를 불러오는 데 실패했습니다.</div>;

  const handleCardClick = (type) => {
    // 실제 앱에서는 STKPage로 상태를 올려서 해당 상세 뷰로 이동시키는 로직이 필요합니다.
    console.log(`[Dashboard] ${type} 상세 목록 페이지로 이동 요청`);
  }
  
  return (
    <div style={{ padding: '20px' }}>
      
      {/* 4개의 핵심 요약 카드 */}
      <div style={styles.gridContainer}>
        {/* Card 1: 유통기한 임박 상품 */}
        <div style={styles.card('#f59e0b')} onClick={() => handleCardClick('ExpiringSoon')}>
          <div style={styles.title}>유통기한 임박 (30일 이내)</div>
          <div style={styles.value('#f59e0b')}>{data.expiringSoon}</div>
          <p style={{fontSize: '0.8rem', color: '#999', margin: 0}}>품목</p>
        </div>

        {/* Card 2: 유통기한 만료 상품 */}
        <div style={styles.card('#dc2626')} onClick={() => handleCardClick('Expired')}>
          <div style={styles.title}>유통기한 만료 상품</div>
          <div style={styles.value('#dc2626')}>{data.expired}</div>
          <p style={{fontSize: '0.8rem', color: '#999', margin: 0}}>품목</p>
        </div>

        {/* Card 3: 발주 필요 재고 */}
        <div style={styles.card('#3b82f6')} onClick={() => handleCardClick('LowStock')}>
          <div style={styles.title}>발주 필요 재고 (Low Stock)</div>
          <div style={styles.value('#3b82f6')}>{data.lowStock}</div>
          <p style={{fontSize: '0.8rem', color: '#999', margin: 0}}>품목</p>
        </div>

        {/* Card 4: 폐기 예정 재고 */}
        <div style={styles.card('#10b981')} onClick={() => handleCardClick('DisposalRequired')}>
          <div style={styles.title}>금주 폐기 예정 수량</div>
          <div style={styles.value('#10b981')}>{data.disposalRequired}</div>
          <p style={{fontSize: '0.8rem', color: '#999', margin: 0}}>수량</p>
        </div>
      </div>

      {/* 최근 폐기 이력 섹션 */}
      <div style={styles.listContainer}>
        <h3 style={styles.listTitle}>최근 폐기 처리 이력</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <div style={{...styles.listItem, fontWeight: '600', color: '#333', borderBottom: '1px solid #ccc'}}>
                <span style={{flex: 3}}>제품명</span>
                <span style={{flex: 1, textAlign: 'center'}}>수량</span>
                <span style={{flex: 2, textAlign: 'center'}}>처리일</span>
                <span style={{flex: 3}}>사유</span>
            </div>
          {data.recentDisposals.map(item => (
            <div 
                key={item.id} 
                style={styles.listItem}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
                <span style={{flex: 3, fontWeight: '500'}}>{item.name}</span>
                <span style={{flex: 1, textAlign: 'center', color: '#dc2626'}}>{item.quantity}</span>
                <span style={{flex: 2, textAlign: 'center', color: '#4b5563'}}>{item.date}</span>
                <span style={{flex: 3, fontSize: '0.85rem', color: '#6b7280'}}>{item.reason}</span>
            </div>
          ))}
          {data.recentDisposals.length === 0 && (
             <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>최근 폐기 이력이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpiryDashboard;
