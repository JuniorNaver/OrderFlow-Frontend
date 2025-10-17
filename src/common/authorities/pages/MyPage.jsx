import React, { useState} from 'react';
import '../styles/MyPage.css'; 

// ⭐️ 임시 사용자 데이터 (기존과 동일)
const DUMMY_USER_DATA = {
    id: 99,
    accountId: 'admin01', // 불변 값
    name: '관리자',
    position: '관리자',      // 불변 값
    storeId: '본사',
    email: 'admin01@orderflow.com',
    phone: '010-1234-5678'
};

const MyPage = () => {
    // ⭐️ 폼 데이터 상태 관리 (기존과 동일)
    const [formData, setFormData] = useState({
        ...DUMMY_USER_DATA,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    
    // ⭐️ 메시지 상태 (기존과 동일)
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // ⭐️ 입력 필드 변경 핸들러 (기존과 동일)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (message) setMessage(''); 
    };

    // ⭐️ 폼 제출 핸들러 (기존과 동일)
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // ... (유효성 검사 및 API 호출 로직 생략)

        // 성공 처리
        setMessage('개인 정보가 성공적으로 수정되었습니다.');
        setIsSuccess(true);
        
        // 비밀번호 필드 초기화
        setFormData((prev) => ({ 
            ...prev, 
            currentPassword: '', 
            newPassword: '', 
            confirmPassword: '' 
        }));
    };
  

    return (
        <div className="mypage-container">
            <h1>개인 정보 수정</h1>

            {/* ⭐️ 변경 불가 핵심 정보 섹션 (기존과 동일) */}
            <div className="key-info-section">
                <div className="key-info-item">
                    <label>아이디</label>
                    <span>{formData.accountId}</span>
                </div>
                <div className="key-info-item">
                    <label>직급</label>
                    <span>{formData.position}</span>
                </div>
            </div>
            
            {message && (
                <div className={`status-message ${isSuccess ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="mypage-form">
                
                {/* ⭐️ 2단 구성을 위한 컨테이너 추가 */}
                <div className="form-content-two-columns"> 
                    
                    {/* 1. 개인 정보 필드 그룹 (왼쪽 열) */}
                    <div className="column-left">
                        {/* 1. 이름 */}
                        <div className="input-group">
                            <label>이름</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        
                        {/* 2. 점포 ID */}
                        <div className="input-group">
                            <label>점포 ID</label>
                            <input type="text" value={formData.storeId} readOnly />
                        </div>

                        {/* 3. 연락처 */}
                        <div className="input-group">
                            <label>연락처</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-XXXX-XXXX" />
                        </div>
                        
                        {/* 4. 이메일 */}
                        <div className="input-group">
                            <label>이메일</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} />
                        </div>
                    </div>

                    {/* 2. 비밀번호 변경 필드 그룹 (오른쪽 열) */}
                    <div className="column-right password-section">
                        <h3>비밀번호 변경 (선택 사항)</h3>

                        {/* 1. 현재 비밀번호 */}
                        <div className="input-group required-field">
                            <label>현재 비밀번호 *</label>
                            <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="정보 수정을 위해 필수" />
                        </div>
                        
                        {/* 2. 새 비밀번호 */}
                        <div className="input-group">
                            <label>새 비밀번호</label>
                            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="변경하지 않으려면 비워두세요" />
                        </div>

                        {/* 3. 새 비밀번호 확인 */}
                        <div className="input-group">
                            <label>비밀번호 확인</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                    </div>
                </div> {/* form-content-two-columns 끝 */}
                
                {/* ⭐️ 버튼 그룹 (2단 컨테이너 바깥, 전체 폼 하단에 위치) */}
                <div className="button-group submit-actions">
                    <button type="submit" className="save-btn">저장</button>
                    <button type="button" onClick={() => window.history.back()} className="cancel-btn">취소</button> 
                </div>

            </form>
        </div>
    );
};

export default MyPage;