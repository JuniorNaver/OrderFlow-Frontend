import React, { useState } from 'react';
import '../styles/Modal.css';

// ⭐️ 백엔드 RoleType Enum의 roleId와 description 매핑
const ROLE_OPTIONS = [
    { id: 'ROLE_CLERK', desc: '점원' },
    { id: 'ROLE_MANAGER', desc: '점장' },
    { id: 'ROLE_ADMIN', desc: '최고 관리자' },
];

const AccountCreateModal = ({ isOpen, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        userId: '',
        password: '',
        name: '',
        email: '',
        storeId: '',
        position: '',// ⭐️ 초기값은 Role ID (예: ROLE_CLERK)가 저장됨
        // ❌ workspace 필드 제거
        enabled: true,
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ 
            ...prev, 
            [name]: type === 'checkbox' 
                ? checked
                : value // storeId는 문자열로 처리
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();


        if (!formData.userId || !formData.password || !formData.name || !formData.storeId || !formData.position) {
            alert("필수 항목을 모두 입력해주세요."); 
            return;
        }

        onCreate(formData); 

        setFormData({ 
            userId: '',
            password: '',
            name: '',
            email: '',
            storeId: '',
            position: '',
            enabled: true,
        });
        onClose();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2 className="modal-title">새 계정 생성</h2>
                <form onSubmit={handleSubmit}>

                    <div className="input-group"> 
                        <label>아이디 (User ID)</label>
                        <input type="text" name="userId" value={formData.userId} onChange={handleChange} placeholder="아이디" required />
                    </div>

                    <div className="input-group"> 
                        <label>이름</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="이름" required />
                    </div>

                    <div className="input-group"> 
                        <label>비밀번호</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호" required />
                    </div>

                    <div className="input-group"> 
                        <label>점포 ID</label>
                        <input type="text" name="storeId" value={formData.storeId} onChange={handleChange} placeholder="점포 ID" required />
                    </div>

                    {/* ❌ workspace 입력 필드 제거 */}

                    {/* ⭐️ 직급(권한) 드롭다운: value는 roleId, 보여주는 것은 description */}
                    <div className="input-group"> 
                        <label>직급 (권한)</label>
                        <select 
                            name="position" 
                            value={formData.position} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- 직급 선택 --</option> 
                            {ROLE_OPTIONS.map(role => (
                                <option key={role.id} value={role.id}> 
                                    {role.desc}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group"> 
                        <label>이메일</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email" />
                    </div>

                    <div className="input-group checkbox-group"> 
                        <input 
                            type="checkbox" 
                            name="enabled" 
                            checked={formData.enabled} 
                            onChange={handleChange} 
                            id="create-enabled"
                        />
                        <label htmlFor="create-enabled">활성화 상태</label>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="submit-btn">계정 생성</button>
                        <button type="button" onClick={onClose} className="cancel-btn">취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountCreateModal;