// ============================================================================
// 📁 src/common/authorities/api/ApiClient.jsx
// ============================================================================
import axios from "axios";
import { toastBus } from "/src/common/utils/ToastBus"; // ✅ 추가

// 백엔드 서버의 기본 URL 지정
const API_BASE_URL = "http://localhost:8080/api";

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
    (error) => Promise.reject(error)
);

// --------------------------------------------------------
// 🛑 응답 인터셉터: 권한 오류 UX 처리 (로그아웃 ❌, 알림만 ✅)
// --------------------------------------------------------
ApiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        // 로그아웃 API 요청 중이면 무시
        if (url?.includes("/auth/logout")) {
            return Promise.reject(error);
        }

        // 401: 인증 만료
        if (status === 401) {
            console.warn("🔒 세션 만료 감지 (401) —", url);
            toastBus.emit("세션이 만료되었습니다. 다시 로그인해주세요.", "error");

            // ✨ 약간의 지연을 두고 AuthProvider에 로그아웃 신호 전달
            setTimeout(() => {
                window.dispatchEvent(new Event("force-logout"));
            }, 2500); // 2.5초 정도 기다린 뒤 로그아웃
        }

        // 403: 접근 권한 없음
        if (status === 403) {
            console.warn("🚫 접근 권한 없음 (403)");
            toastBus.emit("이 페이지에 접근할 권한이 없습니다.", "error");
        }

        return Promise.reject(error);
    }
);

export default ApiClient;
