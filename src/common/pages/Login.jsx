import React, { useState, useCallback } from 'react';
// 스타일 파일은 별도로 가정합니다.
import '../style/Login.css'

// 비밀번호 초기화 팝업 컴포넌트 (별도 파일로 분리 추천)
const PasswordResetModal = ({ isOpen, onClose }) => {
    const [id, setId] = useState('');
    const [email, setEmail] = useState('');

    const handleResetSubmit = useCallback((e) => {
        e.preventDefault();
        
        // TODO: 스프링 부트 비밀번호 초기화 API 호출 로직 (Axios 사용 권장)
        console.log('비밀번호 초기화 요청:', { id, email });

        // API 호출 성공 가정:
        alert('이메일로 임시 비밀번호가 발송되었습니다.');
        
        // 팝업 닫기
        onClose();
        
        // 상태 초기화
        setId('');
        setEmail('');

    }, [id, email, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>비밀번호 초기화 요청</h3>
                <form onSubmit={handleResetSubmit}>
                    <label>
                        아이디:
                        <input 
                            type="text" 
                            value={id} 
                            onChange={(e) => setId(e.target.value)} 
                            required 
                        />
                    </label>
                    <br />
                    <label>
                        email:
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </label>
                    <button type="submit">요청</button>
                    <button type="button" onClick={onClose}>닫기</button>
                </form>
            </div>
        </div>
    );
};

// 메인 로그인 컴포넌트
const LoginPage = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // 팝업 상태

    // 로그인 처리 핸들러
    const handleLoginSubmit = useCallback((e) => {
        e.preventDefault();
        setError('');

        // TODO: 스프링 부트 로그인 API 호출 로직 (Axios 사용 권장)
        console.log('로그인 요청:', { userId, password });

        // === API 호출 더미 로직 ===
        if (userId === 'test' && password === '1234') {
            // API 호출 성공 및 JWT 토큰을 받았다고 가정
            const token = 'fake-jwt-token-12345'; 
            localStorage.setItem('authToken', token);
            
            alert('로그인 성공! 토큰 저장 및 메인 페이지로 이동');
            // 실제 구현에서는 React Router DOM의 navigate 함수 등을 사용해 페이지를 이동합니다.
        } else {
            // API 호출 실패 가정
            setError('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
        // ============================

    }, [userId, password]);

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