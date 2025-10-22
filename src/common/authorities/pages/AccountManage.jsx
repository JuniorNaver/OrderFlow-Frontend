import React, { useState, useEffect } from 'react';
import { fetchAccounts, createAccount, updateAccount, deleteAccount } from '../api/AdminService'; 
import AccountCreateModal from '../modals/AccountCreateModal'; 
import AccountEditModal from '../modals/AccountEditModal';   
import '../styles/AccountManage.css'; 
import { Edit, Trash2, UserPlus, Search } from 'lucide-react'; 

// ⭐️ 백엔드 RoleType Enum의 roleId와 description 매핑
const ROLE_OPTIONS = [
    { id: 'ROLE_CLERK', desc: '점원' },
    { id: 'ROLE_MANAGER', desc: '점장' },
    { id: 'ROLE_ADMIN', desc: '최고 관리자' },
];

// roleId를 description으로 변환하는 헬퍼 함수
const getRoleDescription = (roleId) => {
    const role = ROLE_OPTIONS.find(r => r.id === roleId);
    return role ? role.desc : roleId;
};


const AccountManage = () => {
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    // [R] 사용자 목록 조회 및 검색
    const loadAccounts = async (search = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchAccounts(search);
            setAccounts(data.map(acc => ({
                ...acc,
                userId: acc.userId || acc.accountId,
                enabled: acc.enabled !== undefined ? acc.enabled : true,
            })));
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "알 수 없는 에러";
            setError(`계정 목록 조회에 실패했습니다: ${errorMessage}`);
            setAccounts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadAccounts(searchTerm);
    };

   // [C] 계정 생성 로직
    const handleCreate = async (formData) => {
       try {
            const createData = {
            userId: formData.userId,
            password: formData.password,
            name: formData.name,
            email: formData.email,
            workspace: formData.workspace,
            // ⭐️ 백엔드 DTO 필드명인 'roleId'로 전송 (프론트엔드 폼 필드명은 'position' 가정)
            roleId: formData.position, 
            storeId: Number(formData.storeId) || null, // ⭐️ null 처리 추가 (storeId가 없을 수 있음)
            enabled: formData.enabled
        };
        
        const createdUser = await createAccount(createData);
            alert(`계정 ${createdUser.userId}가 성공적으로 생성되었습니다.`);
            setIsCreateModalOpen(false);
            loadAccounts();

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "알 수 없는 에러";
            setError(`계정 생성 실패: ${errorMessage}`);
        }
    };

    // [U] 계정 수정 로직
    const handleEditClick = (account) => {
        setSelectedAccount({
            ...account,
            userId: account.userId || account.accountId,
            enabled: account.enabled !== undefined ? account.enabled : true,
            position: account.position || '', // roleId가 없으면 빈 문자열
        });
        setIsEditModalOpen(true);
    };

    
    const handleUpdate = async (userId, updateData) => {
        try {
            const updatedUser = await updateAccount(userId, {
                name: updateData.name,
                workspace: updateData.workspace,
                email: updateData.email,
                roleId: updateData.position, // ⭐️ 'position' 대신 'roleId'로 전송해야 백엔드 DTO와 일치 (UserUpdateRequestDTO 확인 필요)
                storeId: updateData.storeId ? Number(updateData.storeId) : null,
                enabled: updateData.enabled
            });

            alert(`계정 ${updatedUser.userId}의 정보가 성공적으로 수정되었습니다.`);
            setIsEditModalOpen(false);
            setSelectedAccount(null);
            loadAccounts();

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "알 수 없는 에러";
            setError(`계정 수정 실패: ${errorMessage}`);
        }
    };

    // [D] 단일 계정 삭제 로직
    const handleDelete = async (userId) => {
        if (!window.confirm(`정말로 계정 ID: ${userId} 를 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await deleteAccount(userId);
            alert(`계정 ID: ${userId} 가 성공적으로 삭제되었습니다.`);
            setAccounts(accounts.filter(acc => acc.userId !== userId)); 

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "알 수 없는 에러";
            setError(`계정 삭제 실패: ${errorMessage}`);
        }
    };

    return (
        <div className="account-manage-container">
            <h1 className="page-title">사용자 계정 관리</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="control-panel">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="이름 또는 ID로 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button" disabled={isLoading}>
                        <Search size={18} /> 검색
                    </button>
                </form>
                <button 
                    onClick={() => { setIsCreateModalOpen(true); setError(null); }} 
                    className="create-button"
                >
                    <UserPlus size={18} /> 새 계정 생성
                </button>
            </div>

            {isLoading && <div className="loading-spinner">데이터를 불러오는 중입니다...</div>}
            
            {!isLoading && (
                <div className="table-wrapper">
                    <table className="account-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>이름</th>
                                <th>이메일</th>
                                <th>워크스페이스</th>
                                <th>직책</th> 
                                <th>점포 ID</th>
                                <th>활성화</th> 
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.length > 0 ? (
                                accounts.map((account) => (
                                    <tr key={account.userId || account.name + account.email}>
                                        <td>{account.userId}</td>
                                        <td>{account.name}</td>
                                        <td>{account.email}</td>
                                        <td>{account.workspace}</td> 
                                        <td>{getRoleDescription(account.position)}</td> {/* ⭐️ 변환하여 표시 */}
                                        <td>{account.storeId}</td> 
                                        <td>{account.enabled ? 'Y' : 'N'}</td> 
                                        <td className="action-buttons">
                                            <button 
                                                onClick={() => handleEditClick(account)} 
                                                className="edit-button"
                                                title="수정"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(account.userId)} 
                                                className="delete-button"
                                                title="삭제"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="no-data">등록된 계정이 없거나 검색 결과가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 모달 컴포넌트 */}
            <AccountCreateModal 
                isOpen={isCreateModalOpen} 
                onClose={() => { setIsCreateModalOpen(false); setError(null); }} 
                onCreate={handleCreate} 
            />

            {selectedAccount && (
                <AccountEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setSelectedAccount(null); setError(null); }}
                    onSave={handleUpdate}
                    accountData={selectedAccount}
                />
            )}
        </div>
    );
};

export default AccountManage;