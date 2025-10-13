import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// ----------------------------------------------------
// 임시 API 함수: 재고 데이터
const fetchStockData = async () => {
  // 실제 API 호출 로직 대신 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 500)); 
  return {
    capacity: [
      { name: '실온', used: 75, total: 100, color: '#4CAF50' }, 
      { name: '냉장', used: 45, total: 60, color: '#2196F3' }, 
      { name: '냉동', used: 90, total: 120, color: '#F44336' }, 
    ],
    relocation: [
      { name: '제품 A-1234', location: '실온 F1', reason: '온도 오류', stock: 100 },
      { name: '제품 B-5678', location: '냉동 G3', reason: '파손 위험', stock: 50 },
    ],
    currentList: [
      { id: 1, name: '제품 X', warehouse: '실온', location: 'A-5', stock: 500 },
      { id: 2, name: '제품 Y', warehouse: '냉장', location: 'B-6', stock: 300 },
      { id: 3, name: '제품 Z', warehouse: '냉동', location: 'C-7', stock: 800 },
    ]
  };
};

// ----------------------------------------------------
// 공통 스타일
const styles = {
  gridContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
  },
  column: {
    flex: '1 1 48%', 
    minWidth: '300px',
  },
  paper: {
    border: '1px solid #eee', 
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    transition: 'box-shadow 0.3s ease',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    padding: '16px',
    paddingBottom: '8px',
    marginBottom: '10px',
    borderBottom: '1px solid #f0f0f0',
  },
  listHeader: {
    fontSize: '0.85rem', color: '#777', padding: '5px 16px', borderBottom: '1px solid #eee', display: 'flex'
  },
  listItem: {
    display: 'flex', padding: '10px 16px', borderBottom: '1px dotted #ccc', fontSize: '0.9rem', alignItems: 'center'
  }
};

// ----------------------------------------------------
// [Sub-Component 1] 적재 용량 시각화
const CapacityVisualization = ({ data }) => {
  const renderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const usagePercent = ((item.value / item.total) * 100).toFixed(1);
      return (
        <div style={{ background: 'white', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', fontSize: '14px' }}>
          <p style={{ fontWeight: 'bold', margin: 0 }}>{item.name} 적재 용량</p>
          <p style={{ margin: '5px 0 0 0' }}>사용: {item.value} / {item.total}</p>
          <p style={{ margin: '0 0 0 0' }}>사용률: {usagePercent}%</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      <h3 style={styles.sectionTitle}>적재 용량</h3>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '200px', padding: '0 16px' }}>
        {data.map((item) => { 
          const dataForPie = [
            { name: '사용', value: item.used, color: item.color, total: item.total },
            { name: '잔여', value: item.total - item.used, color: '#f0f0f0', total: item.total }
          ];

          const usagePercent = ((item.used / item.total) * 100).toFixed(0);

          return (
            <div key={item.name} style={{ width: '120px', height: '100%', textAlign: 'center' }}>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={dataForPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={0}
                    startAngle={90}
                    endAngle={-270}
                    activeIndex={0}
                    isAnimationActive={false}
                  >
                    {dataForPie.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={renderTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: item.color, marginTop: '-20px' }}>{usagePercent}%</div>
              <p style={{ margin: '0', fontWeight: '500', fontSize: '14px', color: '#555' }}>{item.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ----------------------------------------------------
// [Sub-Component 2] 위치 변경 필요 재고
const RelocationRequired = ({ data }) => {
  return (
    <div style={{ paddingTop: '16px' }}>
      <h3 style={styles.sectionTitle}>위치 변경 필요 재고 ({data.length}건)</h3>
      <div style={styles.listHeader}>
        <span style={{ flex: 3 }}>품목명</span>
        <span style={{ flex: 2 }}>현 위치</span>
        <span style={{ flex: 2, textAlign: 'center' }}>사유</span>
        <span style={{ flex: 1, textAlign: 'right' }}>재고</span>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: '180px' }}>
        {data.map((item, index) => (
          <div 
            key={index} 
            style={{ ...styles.listItem, cursor: 'pointer' }}
            onClick={() => console.log(`[STK] ${item.name} 위치 변경 상세 페이지로 이동`)}
          >
            <span style={{ flex: 3, fontWeight: '500' }}>{item.name}</span>
            <span style={{ flex: 2, color: '#2563eb' }}>{item.location}</span>
            <span style={{ flex: 2, textAlign: 'center', color: '#dc2626' }}>{item.reason}</span>
            <span style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{item.stock}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// [Sub-Component 3] 현재 재고 목록
const CurrentStockList = ({ data }) => {
  return (
    <div style={{ paddingTop: '16px' }}>
      <h3 style={styles.sectionTitle}>현재 재고 목록 (총 {data.length}품목)</h3>
      <div style={styles.listHeader}>
        <span style={{ flex: 3 }}>품목명</span>
        <span style={{ flex: 2 }}>창고 구분</span>
        <span style={{ flex: 2, textAlign: 'center' }}>위치</span>
        <span style={{ flex: 1, textAlign: 'right' }}>재고 수량</span>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: '420px' }}>
        {data.map((item) => (
          <div key={item.id} style={styles.listItem}>
            <span style={{ flex: 3, fontWeight: '500' }}>{item.name}</span>
            <span style={{ flex: 2, color: '#4b5563' }}>{item.warehouse}</span>
            <span style={{ flex: 2, textAlign: 'center' }}>{item.location}</span>
            <span style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{item.stock}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


// ----------------------------------------------------
// 메인 CurrentStockDashboard 컴포넌트
const CurrentStockDashboard = () => {
  // useQuery 훅은 react-query 라이브러리가 필요합니다.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['currentStockData'],
    queryFn: fetchStockData,
  });

  if (isLoading) {
    return <div style={{ padding: '30px', textAlign: 'center', fontSize: '1.2rem' }}>데이터 로딩 중...</div>;
  }

  if (isError) {
    return <div style={{ padding: '30px', color: 'red', textAlign: 'center', fontSize: '1.2rem' }}>재고 데이터를 불러오는 데 실패했습니다.</div>;
  }
  
  return (
    <div style={styles.gridContainer}>
      
      {/* 좌측 컬럼 */}
      <div style={styles.column}>
        {/* 1. 적재 용량 */}
        <div style={{ ...styles.paper, height: '350px', marginBottom: '24px' }}>
          <CapacityVisualization data={data.capacity} /> 
        </div>

        {/* 2. 위치 변경 필요 재고 */}
        <div style={{ ...styles.paper, minHeight: '280px' }}>
          <RelocationRequired data={data.relocation} /> 
        </div>
      </div>

      {/* 우측 컬럼: 현재 재고 목록 */}
      <div style={styles.column}>
        <div style={{ ...styles.paper, minHeight: '654px' }}>
          <CurrentStockList data={data.currentList} /> 
        </div>
      </div>
    </div>
  );
};

export default CurrentStockDashboard;
