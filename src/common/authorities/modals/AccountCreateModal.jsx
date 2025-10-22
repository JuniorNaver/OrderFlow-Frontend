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
        position: '',    // ⭐️ 초기값은 Role ID (예: ROLE_CLERK)가 저장됨
        workspace: '',   
        enabled: true,   
    });

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
        
        // 필수 필드 유효성 검사
        if (!formData.userId || !formData.password || !formData.name || !formData.storeId || !formData.workspace || !formData.position) {
            alert("필수 항목을 모두 입력해주세요."); 
            return;
        }
        
        // ⭐️ onCreate로 전송되는 formData.position에는 'ROLE_MANAGER', 'ROLE_CLERK' 등의 roleId가 담겨 있음
        onCreate(formData); 
        
        // 폼 초기화
        setFormData({ 
            userId: '',
            password: '',
            name: '',
            email: '',
            storeId: '',
            position: '',
            workspace: '',
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
                        <input type="number" name="storeId" value={formData.storeId} onChange={handleChange} placeholder="점포 ID" required />
                    </div>
                    
                    <div className="input-group">
                        <label>워크스페이스</label>
                        <input type="text" name="workspace" value={formData.workspace} onChange={handleChange} placeholder="워크스페이스 이름" required />
                    </div>

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
                                <option key={role.id} value={role.id}> {/* ⭐️ value를 roleId로 설정 */}
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