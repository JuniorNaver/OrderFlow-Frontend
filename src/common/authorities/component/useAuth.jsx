import { createContext, useContext } from 'react';

// 1. Context 객체 생성 및 export
// 이 Context 객체는 AuthProvider.jsx에서 Provider로 사용됩니다.
export const AuthContext = createContext(null);

// 2. Custom Hook 정의 및 export
// 컴포넌트들이 이 훅을 통해 인증 상태와 함수에 접근합니다.
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        // Provider 내에서 사용되지 않으면 오류 발생
        throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
    }
    return context;
};