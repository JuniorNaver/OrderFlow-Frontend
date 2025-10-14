import React, { useState } from 'react';
// 모달 스타일을 적용하기 위해 Modal.css를 사용할 수 있습니다.

const AccountCreateModal = ({ isOpen, onClose, onCreate }) => {
   const [formData, setFormData] = useState({
        accountId: '',
        password: '',
        name: '',
        storeId: '',
        position: '점원',
        email: '',
    });

    
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ⭐️ 유효성 검사 로직 추가 (예: 필수 필드 누락 여부 확인)
    if (!formData.accountId || !formData.password || !formData.name || !formData.storeId) {
        alert("필수 항목을 모두 입력해주세요.");
        return;
    }
    
    onCreate(formData); // 상위 컴포넌트(AccountManage)로 데이터 전달
    setFormData({ // 폼 초기화
        accountId: '',
        password: '',
        name: '',
        storeId: '',
        position: '점장',
        email: '',
    });
  };

  return (
    <div className="modal-backdrop">
            <div className="modal-content">
                <h2>계정 생성</h2>
                <form onSubmit={handleSubmit}>
                    
                    {/* ⭐️ 아이디: input-group으로 감싸기 */}
                    <div className="input-group"> 
                        <label>아이디</label>
                        <input 
                            type="text" 
                            name="accountId" 
                            value={formData.accountId} 
                            onChange={handleChange} 
                            placeholder="아이디" 
                            required 
                        />
                    </div>
                    
                    {/* ⭐️ 비밀번호: input-group으로 감싸기 */}
                    <div className="input-group"> 
                        <label>비밀번호</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder="비밀번호" 
                            required 
                        />
                    </div>

                    {/* ⭐️ 이름: input-group으로 감싸기 */}
                    <div className="input-group"> 
                        <label>이름</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder="이름" 
                            required 
                        />
                    </div>

                    {/* ⭐️ 점포 ID: input-group으로 감싸기 */}
                    <div className="input-group"> 
                        <label>점포 ID</label>
                        <input 
                            type="text" 
                            name="storeId" 
                            value={formData.storeId} 
                            onChange={handleChange} 
                            placeholder="점포 ID" 
                            required 
                        />
                    </div>

                    {/* ⭐️ 직급(권한): input-group으로 감싸기 */}
                    <div className="input-group"> 
                        <label>직급 (권한)</label>
                        <select 
                            name="position" 
                            value={formData.position} 
                            onChange={handleChange}
                            required
                        >
                            <option value="점원">점원</option>
                            <option value="점장">점장</option>
                        </select>
                    </div>
                    
                    {/* ⭐️ 이메일 (선택): input-group으로 감싸기 */}
                    <div className="input-group"> 
                        <label>email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            placeholder="email"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="submit-btn">생성</button>
                        <button type="button" onClick={onClose} className="cancel-btn">취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountCreateModal;