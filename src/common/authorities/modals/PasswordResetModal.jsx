import React, { useState, useCallback } from 'react';
import { requestPasswordReset } from '../api/AuthService'; // ⭐️ 추가
import '../styles/Modal.css'; 

const PasswordResetModal = ({ isOpen, onClose }) => {
    // 폼 입력 상태 관리
    const [id, setId] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); // 성공/실패 메시지 표시용
    const [isRequesting, setIsRequesting] = useState(false); // ⭐️ 중복 요청 방지

    // 초기화 버튼 클릭 시 API 호출 처리
    const handleResetSubmit = useCallback(async (e) => {
        e.preventDefault();
        setMessage(''); 
        
        if (isRequesting) return; // 중복 요청 방지

        // 입력값 유효성 검사
        if (!id || !email) {
            setMessage('아이디와 이메일을 모두 입력해주세요.');
            return;
        }
        
        setIsRequesting(true); // ⭐️ 요청 시작

        try {
            // ⭐️ 실제 API 호출
            await requestPasswordReset(id, email);

            setMessage('✅ 이메일로 비밀번호 재설정 링크가 발송되었습니다.');
            
            // 성공 후 입력 필드 초기화
            setId('');
            setEmail('');

            // 3초 후 모달 닫기
            setTimeout(() => {
                onClose();
            }, 3000);

        } catch (error) {
            // API 호출 실패 처리
            const errorMessage = error.response?.data?.message || '비밀번호 초기화 요청 중 오류가 발생했습니다.';
            setMessage(`❌ 오류: ${errorMessage}`);
        } finally {
             setIsRequesting(false); // ⭐️ 요청 완료
        }

    }, [id, email, onClose, isRequesting]); // isRequesting 추가

    // 모달 외부 클릭 시 닫기 위한 핸들러 (기존 로직 유지)
    const handleBackdropClick = useCallback((e) => {
        if (e.target.className === 'modal-backdrop') {
            onClose();
        }
    }, [onClose]);

    if (!isOpen) return null;

    // 모달 UI 반환
    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <h3>비밀번호 초기화 요청</h3>
                
                {/* 설명 문구 */}
                <p className="modal-description">
                    등록된 아이디와 이메일을 입력하시면, 비밀번호 재설정을 위한 링크를 이메일로 보내드립니다.
                </p>
                
                <form onSubmit={handleResetSubmit}>
                    <div className="input-group">
                        <label htmlFor="reset-id">아이디:</label>
                        <input 
                            id="reset-id"
                            type="text" 
                            value={id} 
                            onChange={(e) => setId(e.target.value)} 
                            required 
                            disabled={isRequesting}
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="reset-email">이메일:</label>
                        <input 
                            id="reset-email"
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            disabled={isRequesting}
                        />
                    </div>
                    
                    {/* 메시지 출력 영역 */}
                    {message && <p className={`status-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}

                    <div className="button-group">
                        <button 
                            type="submit" 
                            disabled={!id || !email || isRequesting} // ⭐️ 요청 중일 때 비활성화
                        >
                            {isRequesting ? '요청 중...' : '요청'}
                        </button>
                        <button type="button" onClick={onClose} className="close-button" disabled={isRequesting}>닫기</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordResetModal;