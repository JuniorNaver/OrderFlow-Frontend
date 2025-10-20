import React from 'react';
// useAuth.jsx에서 정의된 useAuth 훅을 사용합니다.
import { useAuth } from './useAuth'; 
import { Navigate, Outlet } from 'react-router-dom';

/**
 * 인증된 사용자만 접근할 수 있는 라우트를 보호하는 컴포넌트입니다.
 * 인증되지 않은 사용자는 /login 경로로 리디렉션됩니다.
 */
const ProtectedRoute = () => {
    // useAuth 훅을 사용하여 AuthProvider가 제공하는 인증 상태를 가져옵니다.
    const { isAuthenticated, loading } = useAuth();
    
    // 1. 인증 정보 로딩이 완료될 때까지 대기
    if (loading) {
        // 로딩 중일 때 사용자에게 피드백을 제공합니다.
        // AuthProvider에도 유사한 로직이 있으므로, 여기서는 간단한 <div>를 반환하거나 
        // 렌더링을 지연시킬 수 있습니다.
        return <div className="flex justify-center items-center h-screen text-lg text-gray-700">인증 정보 확인 중...</div>; 
    }

    // 2. 인증이 되지 않았다면 /login 경로로 강제 이동합니다.
    if (!isAuthenticated) {
        // replace 속성을 사용하여 뒤로 가기 버튼으로 보호된 페이지에 다시 접근하는 것을 방지합니다.
        return <Navigate to="/login" replace />; 
    }

    // 3. 인증되었다면, Outlet을 통해 하위 라우트(보호된 컴포넌트)를 렌더링합니다.
    return <Outlet />;
};

export default ProtectedRoute;