import { createContext, useContext, useState, useEffect } from "react";

// Context 생성
const AuthContext = createContext(null);

/**
 * AuthProvider
 * - 로그인 정보 (user) 전역 관리
 * - 초기 로딩 시 localStorage 또는 API에서 사용자 정보 가져옴
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // ✅ 초기 로드: localStorage에서 사용자 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem("orderflow_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // ✅ 로그인 (임시 예시)
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("orderflow_user", JSON.stringify(userData));
  };

  // ✅ 로그아웃
  const logout = () => {
    setUser(null);
    localStorage.removeItem("orderflow_user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Custom Hook (간편하게 접근)
export function useAuth() {
  return useContext(AuthContext);
}
