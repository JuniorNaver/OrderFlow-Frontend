import axios from 'axios';

// ⭐️ 백엔드 서버의 기본 URL을 설정합니다.
const API_BASE_URL = 'http://localhost:8080/api'; 

const ApiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10초 타임아웃 설정
    headers: {
        'Content-Type': 'application/json',
    },
});

// --------------------------------------------------------
// 🚀 요청 인터셉터: 로컬 저장소의 토큰을 가져와 Header에 자동 추가
// --------------------------------------------------------
ApiClient.interceptors.request.use(
    (config) => {
        // 'accessToken' 키로 저장된 토큰을 가져옵니다.
        const token = localStorage.getItem('accessToken'); 
        if (token) {
            // JWT 토큰 형식에 맞춰 Authorization 헤더 설정
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --------------------------------------------------------
// 🛑 응답 인터셉터: 인증 오류 (401 Unauthorized) 처리
// --------------------------------------------------------
ApiClient.interceptors.response.use(
    (response) => {
        // 성공 응답일 경우 데이터만 반환합니다.
        return response.data; 
    },
    (error) => {
        const status = error.response?.status;
        const originalRequest = error.config;
        
        // 401 Unauthorized 오류가 발생했고, 재시도 요청이 아닌 경우
        if (status === 401 && !originalRequest._retry) {
            
            console.error("인증 만료(401): 토큰 제거 및 강제 로그아웃 유도");
            
            // 1. 저장된 모든 인증 정보 제거
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken'); 
            
            // 2. AuthProvider가 이 에러를 처리하고 로그인 페이지로 이동하도록 Promise.reject(error)를 반환합니다.
            // 만약 AuthProvider가 이 로직을 처리하지 않는다면, window.location.href = '/login'; 을 사용하여 강제 이동해야 합니다.
        }
        
        // 모든 오류는 호출한 서비스 레이어로 전달
        return Promise.reject(error);
    }
);

export default ApiClient;
