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
        // 로컬 스토리지에서 액세스 토큰을 가져옵니다.
        const accessToken = localStorage.getItem('accessToken'); 
        
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
        // 성공 응답일 경우 데이터만 반환합니다.
        return response.data; 
    },
    (error) => {
        const status = error.response?.status;
        // ⭐️ error.config를 originalRequest 변수에 할당합니다. ⭐️
        const originalRequest = error.config;
        
        // 401 Unauthorized 오류가 발생했고, 재시도 요청이 아닌 경우
        if (status === 401 && originalRequest && !originalRequest._retry) {
            
            console.error("인증 만료(401): 토큰 제거 및 강제 로그아웃 유도");
            
            // 1. 저장된 모든 인증 정보 제거
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken'); 
            
            // 2. AuthProvider가 이 에러를 처리하고 로그인 페이지로 이동하도록 Promise.reject(error)를 반환합니다.
        }
        
        // 모든 오류는 호출한 서비스 레이어로 전달
        return Promise.reject(error);
    }
);

export default ApiClient;