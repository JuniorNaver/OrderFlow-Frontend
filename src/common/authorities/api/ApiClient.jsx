// ============================================================================
// 📁 src/common/authorities/api/ApiClient.jsx
// ============================================================================
import axios from 'axios';

// ⭐️ 백엔드 서버의 기본 URL을 설정합니다.
const API_BASE_URL = 'http://localhost:8080/api';

const ApiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10초 타임아웃 설정
    headers: {
        "Content-Type": "application/json",
    },
});

// --------------------------------------------------------
// 🚀 요청 인터셉터: 로컬 저장소의 토큰을 가져와 Header에 자동 추가
// --------------------------------------------------------
ApiClient.interceptors.request.use(
    (config) => {
        // 로컬 스토리지에서 액세스 토큰을 가져옵니다.
        const accessToken = localStorage.getItem("accessToken"); 
        
        if (accessToken) {
            // 토큰이 있으면 Authorization 헤더에 Bearer 토큰 형식으로 추가합니다.
            config.headers.Authorization = `Bearer ${accessToken}`; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --------------------------------------------------------
// 🛑 응답 인터셉터: 데이터 반환 및 인증 오류 (401 Unauthorized) 처리
// --------------------------------------------------------
// (주의: 요청 인터셉터에 오타가 있어 response.use가 두 번 사용된 것으로 보이나,
//  여기서는 로직을 합쳐서 한 번의 응답 인터셉터로 처리합니다.)
ApiClient.interceptors.response.use(
    (response) => {
        // ✅ 성공 응답일 경우 data만 반환
        return response.data;
    },
    (error) => {
        const status = error.response?.status;
        // ⭐️ error.config를 originalRequest 변수에 할당합니다. ⭐️
        const originalRequest = error.config;

        // ✅ 401 Unauthorized 처리
        if (status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            // 🔸 로그아웃 API 요청 중에는 이 로직을 건너뜀 (중복 처리 방지)
            if (!originalRequest.url.includes("/auth/logout")) {
                console.warn("🔒 인증 만료: 토큰 제거 및 로그인 페이지로 이동");

                // 1. 토큰 및 세션 정보 제거
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                sessionStorage.clear();

                // 2. 로그인 페이지로 리다이렉트
                window.location.href = "/login";
            }
        }

        // 모든 오류는 호출한 서비스 레이어로 전달
        return Promise.reject(error);
    }
);

export default ApiClient;
