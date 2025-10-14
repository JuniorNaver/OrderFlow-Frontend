import React, { useState, useEffect } from 'react';
import '../style/Modal.css'; // 모달 스타일은 재사용합니다.

const AccountEditModal = ({ isOpen, onClose, onSave, accountData }) => {
  const [formData, setFormData] = useState(accountData);

  // ⭐️ accountData가 변경될 때마다 폼 데이터를 업데이트합니다.
  // 이 부분이 없다면, 모달을 열었을 때 이전 계정 정보가 남아있을 수 있습니다.
  useEffect(() => {
    if (accountData) {
      setFormData(accountData);
    }
  }, [accountData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ⭐️ 유효성 검사 로직 추가 (필요시)
    if (!formData.accountId || !formData.name || !formData.storeId) {
        alert("필수 항목을 모두 입력해주세요.");
        return;
    }
    
    // ⭐️ 수정된 데이터를 상위 컴포넌트로 전달합니다.
    onSave(formData);
    onClose(); // 저장 후 모달 닫기
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>계정 수정</h2>
        <form onSubmit={handleSubmit}>
          {/* 아이디는 수정 불가능하도록 readonly로 설정 */}
          <div className="input-group">
            <label>아이디</label>
            <input 
              type="text" 
              name="accountId" 
              value={formData.accountId} 
              readOnly // 아이디 수정 불가능하게
              className="read-only"
            />
          </div>
          
          {/* 비밀번호는 별도 초기화 버튼으로 처리하는 경우가 많으나, 여기서는 입력 필드로 남겨둡니다. */}
          <div className="input-group">
            <label>비밀번호</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="변경할 비밀번호를 입력" 
            />
          </div>
          
          <div className="input-group">
            <label>이름</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>점포 ID</label>
            <input 
              type="text" 
              name="storeId" 
              value={formData.storeId} 
              onChange={handleChange} 
              required 
            />
          </div>
          
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

          <div className="input-group">
            <label>email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="submit-btn">저장</button>
            <button type="button" onClick={onClose} className="cancel-btn">취소</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountEditModal;