// ============================================================================
// 📁 src/common/authorities/component/AuthProvider.jsx
// ============================================================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './useAuth'; // useAuth.jsx에서 정의된 Context
import { loginUser, fetchMyInfo, logoutUser } from '../api/AuthService'; // ✅ 함수명 일치

/**
 * 전역 인증 상태와 인증 관련 기능을 제공하는 Provider 컴포넌트입니다.
 * - 로그인 / 로그아웃 / 토큰 검증 / 사용자 정보 로드 관리
 * - 모든 인증 관련 로직은 여기서 통합 관리
 */
export const AuthProvider = ({ children }) => {
    // 현재 인증된 사용자 정보 (로그아웃 상태면 null)
    const [user, setUser] = useState(null);
    
    // 초기 토큰 검증 및 사용자 정보 로딩 상태 (true면 로딩 중)
    const [loading, setLoading] = useState(true); 
    
    const navigate = useNavigate();

    // ------------------------------------------------------------------
    // 1. 사용자 정보 로드 (토큰 기반)
    // ------------------------------------------------------------------
    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                // 토큰이 유효하면 사용자 정보를 가져옵니다.
                // GET /api/auth/users/me 호출
                const response = await fetchMyInfo(); 
                setUser(response); // 사용자 정보로 user 상태 업데이트
            } catch (error) {
                // 토큰 만료(401) 또는 유효성 검사 실패 시
                console.error("토큰 검증 또는 사용자 로드 실패:", error);
                localStorage.removeItem('accessToken');
                setUser(null);
            }
        }
        // 사용자 로드 또는 검증이 완료되면 loading 상태를 false로 설정합니다.
        setLoading(false); 
    }, []);

    // ------------------------------------------------------------------
    // 2. 로그인 핸들러
    // ------------------------------------------------------------------
    const login = useCallback(async (userId, password) => {
        try {
            const tokenResponse = await loginUser(userId, password);
            // 로그인 성공 후 토큰이 저장되었으므로 사용자 정보를 다시 로드
            await loadUser(); 
            // 로그인 성공 후 대시보드나 메인 페이지로 이동
            navigate('/');
            return tokenResponse;
        } catch (error) {
            console.error("로그인 실패:", error);
            setUser(null);
            // UI에 오류 메시지를 표시하기 위해 예외를 다시 던집니다.
            throw error; 
        }
    }, [loadUser, navigate]);

    // ------------------------------------------------------------------
    // 3. 로그아웃 핸들러
    // ------------------------------------------------------------------
    const logout = useCallback(async () => {
        try {
            await logoutUser(); // 서버 측 로그아웃 호출 (옵션)
        } catch (error) {
            console.warn("서버 측 로그아웃 처리 중 오류 발생:", error);
        }
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        navigate('/login', { replace: true });
    }, [navigate]);
    
    // ------------------------------------------------------------------
    // 4. 초기 로드 및 401 처리 (✨ 수정됨)
    // ------------------------------------------------------------------
    useEffect(() => {
        loadUser();

        // ✨ ApiClient에서 발생하는 "force-logout" 이벤트를 수신하여 자동 로그아웃 처리
        const handleForceLogout = () => {
            console.log("⚠️ ApiClient로부터 세션 만료 신호 수신 → 자동 로그아웃 실행");
            logout();
        };

        window.addEventListener("force-logout", handleForceLogout);

        // 컴포넌트 언마운트 시 이벤트 리스너 해제
        return () => {
            window.removeEventListener("force-logout", handleForceLogout);
        };
    }, [loadUser, logout]);
    
    // 인증 상태 계산
    const isAuthenticated = user !== null;
    
    // ------------------------------------------------------------------
    // 5. Context 값 및 Provider 렌더링
    // ------------------------------------------------------------------
    const contextValue = useMemo(
        () => ({
            isAuthenticated, 
            user,
            loading, // ProtectedRoute에서 로딩 여부를 판단할 수 있도록 제공
            login,
            logout,
        }),
        [isAuthenticated, user, loading, login, logout]
    );

    // 로딩 중일 때는 로딩 스피너를 보여주거나 빈 화면을 보여줍니다.
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg text-gray-700">
                인증 정보 로딩 중...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 기본 export는 AuthProvider가 되도록 설정
export default AuthProvider;
