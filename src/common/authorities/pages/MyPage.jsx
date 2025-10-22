import React, { useState, useEffect } from 'react';
import { fetchMyInfo, updateMyInfo } from '../api/AuthService'; 
import '../styles/MyPage.css'; 

// 서버에서 데이터를 로드할 때까지 사용할 초기 빈 상태
// userId/accountId를 빈 문자열로 초기화하여 렌더링 시점에 undefined 오류를 방지합니다.
const INITIAL_USER_STATE = {
    id: null,
    accountId: '', // 렌더링 에러 방지를 위한 빈 문자열 초기화
    name: '',
    position: '',
    storeId: '',
    email: '',
    phone: '',
    // userId 필드도 백엔드 응답을 처리하기 위해 초기화합니다.
    userId: '', 
};

const MyPage = () => {
    // 폼 데이터 상태 관리: 사용자 정보 + 비밀번호 필드
    const [formData, setFormData] = useState({
        ...INITIAL_USER_STATE,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // [R] 컴포넌트 마운트 시 사용자 정보 로드
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                // API를 통해 현재 로그인된 사용자 정보 조회
                const data = await fetchMyInfo(); 
                
                // ⭐️ 40번째 줄 주변: 데이터 유효성 검사 추가 ⭐️
                if (!data || typeof data !== 'object') {
                    // 데이터가 유효하지 않으면 (undefined, null, 또는 객체가 아닌 경우) 에러 처리
                    throw new Error("서버로부터 유효하지 않은 사용자 정보가 수신되었습니다.");
                }
                
                // 45번째 줄 (이제 data가 유효함을 보장)
                setFormData(prev => ({ 
                    ...prev, 
                    ...data, 
                    accountId: data.accountId || data.userId || prev.accountId, 
                }));
                
            } catch (err) {
                const errorMessage = err.response?.data?.message || '사용자 정보를 불러오는 데 실패했습니다.';
                setMessage(errorMessage);
                setIsSuccess(false);
            } finally {
                setIsLoading(false);
            }
        };
        loadUserInfo();
    }, []);

    // 입력 필드 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (message) setMessage(''); 
    };

    // [U] 폼 제출 핸들러 (유효성 검사 및 API 호출)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(false);

        const { name, email, phone, currentPassword, newPassword, confirmPassword } = formData;

        // 1. 필수 필드 검사: 현재 비밀번호
        if (!currentPassword) {
            setMessage('정보 수정을 위해 현재 비밀번호를 입력해야 합니다.');
            return;
        }

        // 2. 새 비밀번호 유효성 검사
        if (newPassword) {
            if (newPassword.length < 4) { 
                setMessage('새 비밀번호는 최소 4자 이상이어야 합니다.');
                return;
            }
            if (newPassword !== confirmPassword) {
                setMessage('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
                return;
            }
        }
        
        // 3. API 호출 데이터 구성 (백엔드 DTO에 맞게 구성)
        const updateData = {
            name,
            email,
            phone,
            currentPassword,
            newPassword: newPassword || null, // 없으면 null 전송
        };

        try {
            // API 호출: PUT /api/auth/users/me (AuthService에서 경로 수정 완료 가정)
            await updateMyInfo(updateData);

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
            
        } catch (err) {
             const errorMessage = err.response?.data?.message || err.message || "알 수 없는 에러";
             setMessage(`정보 수정 실패: ${errorMessage}`);
             setIsSuccess(false);
             // 비밀번호 오류 시 현재 비밀번호 필드만 비워 재입력 유도
             setFormData((prev) => ({ ...prev, currentPassword: '' })); 
        }
    };
    
    // 로딩 중일 때 표시
    if (isLoading) {
        return <div className="loading-spinner">사용자 정보를 불러오는 중입니다...</div>;
    }
    
    // UI 렌더링
    return (
        <div className="mypage-container">
            <h1>개인 정보 수정</h1>

            {/* 변경 불가 핵심 정보 섹션 */}
            <div className="key-info-section">
                <div className="key-info-item">
                    <label>아이디</label>
                    {/* ⭐️ 40번째 줄 주변: formData.accountId를 안전하게 렌더링 */}
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
                
                {/* 2단 구성을 위한 컨테이너 */}
                <div className="form-content-two-columns"> 
                    
                    {/* 1. 개인 정보 필드 그룹 (왼쪽 열) */}
                    <div className="column-left">
                        {/* 1. 이름 */}
                        <div className="input-group">
                            <label>이름</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        
                        {/* 2. 점포 ID (읽기 전용) */}
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
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
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
                
                {/* 버튼 그룹 */}
                <div className="button-group submit-actions">
                    <button type="submit" className="save-btn">저장</button>
                    <button type="button" onClick={() => window.history.back()} className="cancel-btn">취소</button> 
                </div>

            </form>
        </div>
    );
};

export default MyPage;