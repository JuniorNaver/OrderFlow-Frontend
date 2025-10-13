import React, { useState, useEffect } from 'react';
import CurrentTimeDisplay from '../components/CurrentTimeDisplay'; 
// 하위 메뉴에 따라 동적으로 렌더링될 뷰 컴포넌트들을 가져옵니다.
import CurrentStockDashboard from '../components/CurrentStockDashboard'; // (1) 현재 재고 현황 조회
import ExpiryDashboard from '../components/ExpiryDashboard';           // (2) 유통기한 임박 상품 관리 (대시보드)
import ExpiryManagementView from '../components/ExpiryManagementView'; // (3) 유통기한 마감 상품 관리 (상세 목록)
import StockAdjustmentView from '../components/StockAdjustmentView';   // (4) 재고 수량 조정

// ----------------------------------------------------
// 순수 스타일링 및 레이아웃 정의
const styles = {
  container: {
    padding: '0 20px 20px 20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '10px 0', 
    marginBottom: '20px',
    borderBottom: '1px solid #ddd',
    width: '100%',
    boxSizing: 'border-box',
  },
  mainContent: {
    padding: '0',
  },
};


// ----------------------------------------------------
// 메인 STKPage 컴포넌트 (페이지 파일) - 동적 콘텐츠 컨테이너 역할
// 상위 컴포넌트(글로벌 메뉴)에서 `activeMenu` prop을 받는다고 가정합니다.
function STKPage({ activeMenu }) {
  // internalPage 상태는 외부에서 받은 activeMenu prop을 기반으로 초기화됩니다.
  // prop이 없거나 유효하지 않으면 'CurrentStockDashboard'를 기본값으로 사용합니다.
  const [internalPage, setInternalPage] = useState(activeMenu || 'CurrentStockDashboard'); 

  // activeMenu prop이 변경될 때마다 internalPage 상태를 업데이트하여 화면을 전환합니다.
  useEffect(() => {
    if (activeMenu) {
        setInternalPage(activeMenu);
    }
  }, [activeMenu]);

 // STKPage.jsx 내의 renderContent 함수를 이렇게 수정해야 합니다.
  const renderContent = (pagePath) => { // pagePath는 이제 '/stk/expire-soon' 같은 경로여야 함
    switch (pagePath) {
      case '/stk/pages/StockStatus': // (1') 현재 재고 현황 조회
        return <CurrentStockDashboard />;
      case '/stk/expire-soon': // (2') 유통기한 임박 상품 관리
        return <ExpiryDashboard />; 
      case '/stk/expired': // (3') 유통기한 마감 상품 관리
        return <ExpiryManagementView />; 
      case '/stk/adjust': // (4') 재고 수량 조정
        return <StockAdjustmentView />;
      default:
        // 기본값도 첫 번째 경로로 설정하는 것이 좋습니다.
        return <CurrentStockDashboard />;
    }
  };

  // 현재 페이지의 제목을 반환하는 함수 (화면 상단 제목용)
  const getPageTitle = (page) => {
    switch (page) {
      case 'CurrentStockDashboard': return '현재 재고 현황 조회';
      case 'ExpiryManagement': return '유통기한 임박 상품 관리';
      case 'ExpiryClosingManagement': return '유통기한 마감 상품 관리';
      case 'StockAdjustment': return '재고 수량 조정';
      default: return '재고 관리 시스템 (STK)';
    }
  };

  return (
    <div style={styles.container}>
      {/* 페이지 헤더 */}
      <div style={styles.header}>
        {/* 현재 활성화된 하위 메뉴 제목 표시 */}
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          {getPageTitle(internalPage)}
        </h2>
        <CurrentTimeDisplay />
      </div>

      {/* 메인 콘텐츠 영역: 동적으로 선택된 컴포넌트가 렌더링됩니다. */}
      <div style={styles.mainContent}>
        {renderContent(internalPage)}
      </div>
    </div>
  );
}

export default STKPage;
