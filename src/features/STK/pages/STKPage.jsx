// features/STK/pages/STKPage.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * 재고관리(STK) 도메인의 레이아웃 컴포넌트입니다.
 * App.jsx에 정의된 모든 하위 경로 컴포넌트를 <Outlet />을 통해 렌더링합니다.
 */
const STKPage = () => {
    return (
        <div className="stk-page-container" style={{ minHeight: '80vh', padding: '0 16px' }}>
            {/* 이 부분이 App.jsx에서 정의된 자식 컴포넌트 (대시보드, 뷰)를 표시합니다. */}
            <Outlet />
        </div>
    );
};

export default STKPage;