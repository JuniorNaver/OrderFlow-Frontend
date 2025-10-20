import React, { useState, useCallback } from 'react';
// 💡 useNavigate는 더 이상 필요 없으므로 import를 완전히 제거합니다.
import '../styles/Login.css';

// 💡 useAuth 훅 임포트
import { useAuth } from '../component/useAuth';


// ⭐️ API 기본 URL 정의 (PasswordResetModal에서 사용)
const API_BASE_URL = 'http://localhost:8080';

// =========================================================================
// 비밀번호 초기화 팝업 컴포넌트 (API 연결)
// =========================================================================
const PasswordResetModal = ({ isOpen, onClose }) => {
    const [id, setId] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // ⭐️ 비밀번호 초기화 요청 API 호출 핸들러
    const handleResetSubmit = useCallback(async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/password/reset-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id, email }),
            });

            if (response.ok) {
                setMessage('이메일로 비밀번호 재설정 링크가 발송되었습니다. 확인해 주세요.');
                setIsSuccess(true);
            } else {
                const errorText = await response.text();
                setMessage(errorText || '비밀번호 초기화 요청에 실패했습니다. 정보를 확인해 주세요.');
                setIsSuccess(false);
            }

        } catch (error) {
            console.error('API 통신 오류:', error);
            setMessage('서버와 통신할 수 없습니다.');
            setIsSuccess(false);
        }

    }, [id, email]);

    // 팝업 닫기 및 상태 초기화
    const handleClose = () => {
        onClose();
        setId('');
        setEmail('');
        setMessage('');
        setIsSuccess(false);
    }

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>비밀번호 초기화 요청</h3>
                
                {/* ⭐️ 메시지 표시 */}
                {message && (
                    <p className={`status-message ${isSuccess ? 'success' : 'error'}`}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleResetSubmit}>
                    <div className="input-group">
                        <label htmlFor="reset-id">아이디:</label>
                        <input 
                            id="reset-id"
                            type="text" 
                            value={id} 
                            onChange={(e) => setId(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="reset-email">email:</label>
                        <input 
                            id="reset-email"
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="button-group">
                        <button type="submit">요청</button>
                        <button type="button" onClick={handleClose}>닫기</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =========================================================================
// 메인 로그인 컴포넌트 (useAuth 통합)
// =========================================================================
const LoginPage = () => {
    // 💡 useAuth 훅을 사용하여 login 함수 가져오기
    const { login } = useAuth(); 

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ⭐️ 로그인 처리 핸들러 (useAuth 연결)
    const handleLoginSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        try {
            // login 함수 내부에서 API 호출, 토큰 저장 및 페이지 이동이 모두 처리됩니다.
            await login(userId, password); 

        } catch (err) {
            console.error('로그인 오류:', err); 
            // AuthService에서 던져진 오류 메시지를 표시합니다.
            const errorMessage = err.response?.data?.message || err.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해 주세요.';
            setError(errorMessage);
        }

    }, [userId, password, login]); // 의존성 배열 유지

    return (
        <div className="login-container">
            <h1>login</h1>
            <form onSubmit={handleLoginSubmit} className="login-form">
                
                <div className="input-group">
                    <label htmlFor="user-id">ID:</label>
                    <input
                        id="user-id"
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">PW:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <div className="button-group">
                    <button type="submit" className="login-button">로그인</button>
                    
                    {/* 비밀번호 초기화 팝업 열기 버튼 */}
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(true)} 
                        className="reset-button"
                    >
                        비밀번호
                        <br /> 
                        초기화
                    </button>
                </div>
            </form>
            
            {/* 비밀번호 초기화 모달 컴포넌트 */}
            <PasswordResetModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default LoginPage;
