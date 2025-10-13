import React, { useState, useCallback } from 'react';
// 스타일 파일을 임포트했다고 가정 (예: Modal.css)
import '../style/Modal.css'; 

const PasswordResetModal = ({ isOpen, onClose }) => {
    // 폼 입력 상태 관리
    const [id, setId] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); // 성공/실패 메시지 표시용

    // 초기화 버튼 클릭 시 API 호출 처리
    const handleResetSubmit = useCallback(async (e) => {
        e.preventDefault();
        setMessage(''); // 메시지 초기화

        // 입력값 유효성 검사 (간단한 예시)
        if (!id || !email) {
            setMessage('아이디와 이메일을 모두 입력해주세요.');
            return;
        }

        // TODO: 스프링 부트 비밀번호 초기화 API (POST /api/auth/reset-password) 호출 로직
        console.log('비밀번호 초기화 요청 전송:', { id, email });

        try {
            // 실제 Axios 또는 Fetch API를 사용하여 백엔드와 통신하는 부분입니다.
            // await axios.post('/api/auth/reset-password', { id, email });

            // API 호출 성공 가정:
            setMessage('✅ 이메일로 새로운 비밀번호가 발송되었습니다.');
            
            // 성공 후 입력 필드 초기화
            setId('');
            setEmail('');

            // 3초 후 모달 닫기
            setTimeout(() => {
                onClose();
            }, 3000);

        } catch (error) {
            // API 호출 실패 가정:
            const errorMessage = error.response?.data?.message || '비밀번호 초기화 중 오류가 발생했습니다.';
            setMessage(`❌ 오류: ${errorMessage}`);
        }

    }, [id, email, onClose]);

    // 모달 외부 클릭 시 닫기 위한 핸들러
    const handleBackdropClick = useCallback((e) => {
        // 모달의 배경(backdrop)을 클릭했을 때만 닫히도록 설정
        if (e.target.className === 'modal-backdrop') {
            onClose();
        }
    }, [onClose]);

    if (!isOpen) return null;

    // 모달 UI 반환
    return (
        // 모달 배경 (전체 화면을 덮음)
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <h3>비밀번호 초기화 요청</h3>
                
                {/* 폼 */}
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
                    
                    {/* 메시지 출력 영역 */}
                    {message && <p className={`status-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}

                    <div className="button-group">
                        <button type="submit" disabled={!id || !email}>요청</button>
                        <button type="button" onClick={onClose} className="close-button">닫기</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordResetModal;