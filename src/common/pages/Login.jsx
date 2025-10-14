import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // ⭐️ 페이지 이동을 위해 추가
import '../style/Login.css';

// ⭐️ API 기본 URL 정의
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
            // 스프링 부트 비밀번호 초기화 요청 API (새로 정의된 엔드포인트 가정)
            const response = await fetch(`${API_BASE_URL}/api/auth/password/reset-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // 서버의 DTO에 맞게 userId와 email을 전송
                body: JSON.stringify({ userId: id, email }),
            });

            if (response.ok) {
                // 성공 (200 OK 또는 204 No Content)
                setMessage('이메일로 비밀번호 재설정 링크가 발송되었습니다. 확인해 주세요.');
                setIsSuccess(true);
            } else {
                // 실패 (예: 400 Bad Request, 사용자 없음 등)
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
// 메인 로그인 컴포넌트 (API 연결)
// =========================================================================
const LoginPage = () => {
    // ⭐️ navigate 훅 추가
    const navigate = useNavigate();

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ⭐️ 로그인 처리 핸들러 (API 연결)
    const handleLoginSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password }),
            });

            if (response.ok) {
                // 1. 성공 시 TokenResponseDTO (JSON) 파싱
                const tokenResponse = await response.json(); 
                
                // 2. 토큰 저장
                localStorage.setItem('accessToken', tokenResponse.accessToken);
                localStorage.setItem('refreshToken', tokenResponse.refreshToken);
                
                // 3. 메인 페이지로 이동
                // alert('로그인 성공!'); // (선택 사항)
                navigate('/'); 
            } else {
                // 4. 실패 처리 (401 Unauthorized 등)
                const errorText = await response.text(); 
                setError(errorText || '아이디 또는 비밀번호가 일치하지 않습니다.');
            }
        } catch (err) {
            console.error('API 통신 오류:', err);
            setError('서버와 통신할 수 없습니다. 서버 상태를 확인해 주세요.');
        }

    }, [userId, password, navigate]);

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