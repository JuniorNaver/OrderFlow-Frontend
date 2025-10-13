import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// 임시 API 함수: 실제로는 BI 모듈의 fetchInventoryStatus와 유사한 함수를 사용해야 합니다.
const fetchCapacityStatus = async () => {
  // 실제 API 호출 로직이 들어갈 자리입니다.
  await new Promise(resolve => setTimeout(resolve, 800)); 
  
  // 가상의 적재 용량 데이터 (스토리보드: 실온, 냉장, 냉동)
  return [
    { name: '실온', used: 75, total: 100, color: '#4CAF50' }, // Green
    { name: '냉장', used: 45, total: 60, color: '#2196F3' }, // Blue
    { name: '냉동', used: 90, total: 120, color: '#F44336' }, // Red
  ];
};

const styles = {
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      paddingBottom: '8px',
      marginBottom: '10px',
      borderBottom: '1px solid #f0f0f0',
    }
  };

// 적재 용량 시각화 컴포넌트
const CapacityVisualization = () => {
  // useQuery를 사용하여 BI 데이터를 가져옵니다.
  const { data: capacityData, isLoading, isError } = useQuery({
    queryKey: ['stkCapacityStatus'],
    queryFn: fetchCapacityStatus,
  });

  if (isLoading) {
    return <div style={{ padding: '16px' }}>적재 용량 데이터 로딩 중...</div>;
  }

  if (isError) {
    return <div style={{ padding: '16px', color: 'red' }}>적재 용량 데이터를 불러오는 데 실패했습니다.</div>;
  }
  
  // 도넛 차트 데이터를 위해 각 타입별 사용량/총량 비율을 계산
  const chartData = capacityData.map(item => ({
    name: item.name,
    value: item.used,
    remaining: item.total - item.used,
    total: item.total,
    color: item.color
  }));

  // 커스텀 툴팁 포맷터
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
    <div style={{ padding: '16px' }}>
      <h3 style={styles.sectionTitle}>적재 용량</h3>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '240px' }}>
        {chartData.map((item) => { // 👈 사용하지 않는 인자 제거
          // 도넛 차트를 재현하기 위해 Recharts를 사용합니다.
          const dataForPie = [
            { name: '사용', value: item.value, color: item.color },
            { name: '잔여', value: item.remaining, color: '#f0f0f0' }
          ];

          const usagePercent = ((item.value / item.total) * 100).toFixed(0);

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

export default CapacityVisualization;
