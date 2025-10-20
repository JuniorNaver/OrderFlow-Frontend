import ApiClient from './ApiClient';

// =================================================================
// 🚀 1. 로그인 관련
// =================================================================

/**
 * 사용자 로그인 요청을 서버에 전송하고, 성공 시 JWT 토큰을 로컬 스토리지에 저장합니다.
 * @param {string} userId 사용자 아이디 (백엔드 DTO에 따라 userId 사용)
 * @param {string} password 사용자 비밀번호
 */
export const loginUser = async (userId, password) => {
    // 서버 응답 데이터를 response로 받음 (ApiClient 인터셉터 덕분)
    const response = await ApiClient.post('/auth/login', {
        userId: userId, 
        password: password,
    });
    
    // 토큰 이름이 'accessToken'인지 확인하고, refreshToken도 함께 저장
    const accessToken = response.accessToken; // 백엔드 DTO와 일치해야 함
    const refreshToken = response.refreshToken; // 백엔드 DTO에 refreshToken이 있다면 저장

    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        // refreshToken이 있다면 저장 (재발급에 사용)
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken); 
        }
    } else {
        // 토큰이 없으면 로그인 실패로 간주하고 에러 발생
        throw new Error("로그인 응답에 유효한 accessToken이 없습니다.");
    }

    // 성공한 경우 토큰 정보를 포함한 응답을 그대로 반환
    return response;
}; 

/**
 * 현재 로그인된 사용자 정보를 서버로부터 가져옵니다.
 * 이 함수는 토큰 유효성 검사 및 사용자 정보 로드에 사용됩니다.
 */
export const getUserDetails = async () => {
    // UserController.java의 @RequestMapping("/api/auth/users/me")와 일치하도록 경로 수정
    return await ApiClient.get('/auth/users/me'); 
};

/**
 * 로그아웃 요청을 처리합니다.
 */
export const logoutUser = async () => {
    try {
        // 서버 측 로그아웃 엔드포인트 호출 (옵션)
        await ApiClient.post('/auth/logout'); 
    } catch (error) {
        console.warn("서버 측 로그아웃 처리 중 오류 발생:", error);
    }
    // 클라이언트 측에서는 AuthProvider에서 토큰 제거 및 상태 초기화를 수행합니다.
};

// =================================================================
// 🔑 2. 비밀번호 재설정 관련
// =================================================================

/**
 * 비밀번호 재설정 토큰의 유효성을 서버에 확인합니다.
 */
export const validateResetToken = async (token) => {
    try {
        // 백엔드 AuthController의 @GetMapping("/password/validate-token")과 일치
        await ApiClient.get(`/auth/password/validate-token?token=${token}`);
        return true; 
    } catch (error) {
        console.error("토큰 유효성 검사 실패:", error.response?.data || error.message);
        return false;
    }
};

/**
 * 새 비밀번호로 업데이트 요청을 서버에 전송합니다.
 */
export const resetPassword = async (token, newPassword) => {
    // 백엔드 AuthController의 @PostMapping("/password/reset")과 일치
    return await ApiClient.post('/auth/password/reset', {
        token: token,
        newPassword: newPassword
    });
};
