// ============================================================================
// 📁 src/common/authorities/api/AuthService.jsx
// ============================================================================
// 이 모듈은 인증(Authentication) 및 사용자 계정 관련 API 요청을 담당합니다.
// - 로그인, 로그아웃, 사용자 정보 조회/수정, 비밀번호 재설정 등
// - 모든 요청은 ApiClient를 통해 Axios 인스턴스로 전송됩니다.
// ============================================================================

import ApiClient from "./ApiClient";

// ============================================================================
// 🚀 1. 로그인 관련
// ============================================================================

/**
 * 사용자 로그인 요청을 서버에 전송하고, 성공 시 JWT 토큰을 로컬 스토리지에 저장합니다.
 * @param {string} userId 사용자 아이디 (백엔드 DTO에 따라 userId 사용)
 * @param {string} password 사용자 비밀번호
 * @returns {Promise<Object>} TokenResponseDTO (accessToken, refreshToken)
 *
 * 백엔드: AuthController.login()
 * 엔드포인트: POST /api/auth/login
 */
export const loginUser = async (userId, password) => {
  const response = await ApiClient.post("/auth/login", { userId, password });

  // 서버 응답 데이터 구조 확인 (TokenResponseDTO)
  const { accessToken, refreshToken } = response;

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  } else {
    throw new Error("로그인 응답에 유효한 accessToken이 없습니다.");
  }

  return response;
};

/**
 * 현재 로그인된 사용자 정보를 서버로부터 가져옵니다.
 * - 주로 마이페이지(MyPage.jsx)에서 사용됩니다.
 * - 토큰이 유효하지 않으면 ApiClient의 인터셉터가 401을 처리합니다.
 *
 * 백엔드: UserController.getMyDetails()
 * 엔드포인트: GET /api/auth/users/me
 */
export const fetchMyInfo = async () => {
  return await ApiClient.get("/auth/users/me");
};

/**
 * 사용자 개인정보 및 비밀번호를 수정합니다.
 * - 현재 비밀번호 입력 필수 (백엔드 검증용)
 * - 새 비밀번호는 선택 사항 (입력 시만 변경)
 *
 * 백엔드: UserController.updateMyDetails()
 * 엔드포인트: PUT /api/auth/users/me
 *
 * @param {Object} updateData
 * @param {string} updateData.name 사용자 이름
 * @param {string} updateData.email 이메일
 * @param {string} updateData.phone 연락처
 * @param {string} updateData.currentPassword 현재 비밀번호 (필수)
 * @param {string|null} updateData.newPassword 새 비밀번호 (선택)
 */
export const updateMyInfo = async (updateData) => {
  return await ApiClient.put("/auth/users/me", updateData);
};

// ============================================================================
// 🚪 2. 로그아웃 관련
// ============================================================================

/**
 * 서버에 로그아웃 요청을 보내고, 클라이언트 측 토큰을 제거합니다.
 * - 서버에서 refreshToken 무효화 처리 가능
 * - 토큰이 만료되어 401이 발생해도 정상 로그아웃으로 간주합니다.
 *
 * 백엔드: AuthController.logout()
 * 엔드포인트: POST /api/auth/logout
 */
export const logoutUser = async () => {
  try {
    await ApiClient.post("/auth/logout");
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("⚠️ 이미 만료된 세션입니다. (401 Unauthorized)");
    } else {
      console.error("🚨 서버 측 로그아웃 처리 중 오류 발생:", error);
    }
  } finally {
    // ✅ 로컬 토큰 및 세션 정보 정리
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.clear();

    // ✅ 로그인 페이지로 리다이렉트
    window.location.href = "/login";
  }
};

// ============================================================================
// 🔑 3. 비밀번호 재설정 관련
// ============================================================================

/**
 * ⭐️ 비밀번호 재설정 이메일 요청을 서버에 전송합니다. ⭐️
 * * 백엔드: AuthController.requestPasswordReset()
 * 엔드포인트: POST /api/auth/password/reset-request
 * * @param {string} userId 사용자 아이디
 * @param {string} email 사용자 이메일
 * @returns {Promise<void>} 204 No Content
 */
export const requestPasswordResetEmail = async (userId, email) => {
  // 백엔드 DTO에 맞게 userId와 email을 함께 전송
  return await ApiClient.post("/auth/password/reset-request", { userId, email });
};

/**
 * 비밀번호 재설정 토큰의 유효성을 서버에 확인합니다.
 * @param {string} token
 * @returns {boolean} 유효한 경우 true, 실패 시 false
 *
 * 백엔드: AuthController.validatePasswordResetToken()
 * 엔드포인트: GET /api/auth/password/validate-token
 */
export const validateResetToken = async (token) => {
  try {
    // ⚠️ GET 요청은 body를 보내지 않으므로 쿼리 파라미터로 처리합니다.
    await ApiClient.get(`/auth/password/validate-token?token=${token}`); 
    return true;
  } catch (error) {
    console.error("토큰 유효성 검사 실패:", error.response?.data || error.message);
    return false;
  }
};

/**
 * 새 비밀번호로 업데이트 요청을 서버에 전송합니다.
 * @param {string} token 재설정 토큰
 * @param {string} newPassword 새 비밀번호
 *
 * 백엔드: AuthController.resetPassword()
 * 엔드포인트: POST /api/auth/password/reset
 */
export const resetPassword = async (token, newPassword) => {
  return await ApiClient.post("/auth/password/reset", {
    token,
    newPassword,
  });
};