import React, { useState, useEffect } from 'react';
import '../styles/Modal.css';

// ⭐️ 백엔드 RoleType Enum의 roleId와 description 매핑
const ROLE_OPTIONS = [
    { id: 'ROLE_CLERK', desc: '점원' },
    { id: 'ROLE_MANAGER', desc: '점장' },
    { id: 'ROLE_ADMIN', desc: '최고 관리자' },
];

const AccountEditModal = ({ isOpen, onClose, onSave, accountData }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (accountData) {
            setFormData({
                ...accountData, 
                userId: accountData.userId || accountData.accountId || '',
                enabled: accountData.enabled !== undefined ? accountData.enabled : true,
                // ⭐️ 수정: accountData.position에는 roleId가 담겨 있다고 가정
                position: accountData.position || '', 
            });
        }
    }, [accountData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ 
            ...prev, 
            [name]: type === 'checkbox' 
                ? checked
                : (name === 'storeId' && value !== '') ? Number(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 필수 항목 검사
        if (!formData.userId || !formData.name || !formData.storeId || !formData.workspace || !formData.position) {
            alert("필수 항목을 모두 입력해주세요.");
            return;
        }
        
        // ⭐️ DTO에 맞는 필드만 전송 (position에는 roleId가 담겨 있음)
        const updateData = {
            name: formData.name,
            workspace: formData.workspace,
            email: formData.email,
            position: formData.position, 
            storeId: formData.storeId ? Number(formData.storeId) : null,
            enabled: formData.enabled, 
        };

        onSave(formData.userId, updateData);
        onClose(); 
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2 className="modal-title">계정 정보 수정</h2>
                <form onSubmit={handleSubmit}>
                    
                    <div className="input-group">
                        <label>아이디 (User ID)</label>
                        <input type="text" name="userId" value={formData.userId || ''} readOnly className="read-only" />
                    </div>
                    
                    <div className="input-group">
                        <label>이름</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
                    </div>
                    
                    <div className="input-group">
                        <label>점포 ID</label>
                        <input type="number" name="storeId" value={formData.storeId || ''} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>워크스페이스</label>
                        <input type="text" name="workspace" value={formData.workspace || ''} onChange={handleChange} placeholder="워크스페이스 이름" required />
                    </div>

                    {/* ⭐️ 직급 (권한) 필드: value는 roleId, 보여주는 것은 description */}
                    <div className="input-group">
                        <label>직급 (권한)</label>
                        <select 
                            name="position" 
                            value={formData.position || ''} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- 직급 선택 --</option>
                            {ROLE_OPTIONS.map(role => (
                                <option key={role.id} value={role.id}> {/* ⭐️ value를 roleId로 설정 */}
                                    {role.desc}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>이메일</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
                    </div>

                    <div className="input-group checkbox-group"> 
                        <input 
                            type="checkbox" 
                            name="enabled" 
                            checked={formData.enabled || false} 
                            onChange={handleChange} 
                            id="edit-enabled"
                        />
                        <label htmlFor="edit-enabled">활성화 상태</label>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="submit-btn">수정 완료</button>
                        <button type="button" onClick={onClose} className="cancel-btn">취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountEditModal;