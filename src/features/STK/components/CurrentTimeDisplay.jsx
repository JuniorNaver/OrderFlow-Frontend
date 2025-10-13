import React, { useState, useEffect } from 'react';

function CurrentTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // 1초마다 시간 업데이트
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearInterval(timerId);
  }, []);

  // 상단에 표시된 '2025.09.22(일) 오후 7:21' 형태와 비슷한 포맷
  const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

  const formattedDate = currentTime.toLocaleDateString('ko-KR', dateOptions).replace(/\.$/g, '');
  const formattedTime = currentTime.toLocaleTimeString('ko-KR', timeOptions);

  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '14px', color: '#555' }}>
        {formattedDate} {formattedTime}
      </div>
      {/* 스토리보드의 '2025 09 21 시간 분 초'를 단순화하여 현재 시간으로 대체 */}
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>
        {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/:/g, ' ')}
      </div>
    </div>
  );
}

export default CurrentTimeDisplay;