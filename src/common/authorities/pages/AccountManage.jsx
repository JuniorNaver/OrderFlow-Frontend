import React, { useState, useEffect, useCallback } from 'react';
import { fetchAccounts, createAccount, updateAccount, deleteAccount } from '../api/AdminService';
import AccountCreateModal from '../modals/AccountCreateModal';
import AccountEditModal from '../modals/AccountEditModal';
import '../styles/AccountManage.css';
import { Edit, Trash2, UserPlus, Search } from 'lucide-react';
import MiniLoader from '../../../components/loading/MiniLoader';

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

    // 💡 [페이징 State 추가]
    const [currentPage, setCurrentPage] = useState(1);
    const [accountsPerPage] = useState(15); // 15행 고정

    // [R] 사용자 목록 조회 및 검색
    // useCallback을 사용하여 loadAccounts 함수가 불필요하게 재생성되는 것을 방지합니다.
    const loadAccounts = useCallback(async (search = '') => {
        setIsLoading(true);
        setError(null);
        try {
            // fetchAccounts가 Promise를 반환한다고 가정
            const data = await fetchAccounts(search); 
            setAccounts(data.map(acc => ({
                ...acc,
                userId: acc.userId || acc.accountId,
                position: acc.position || acc.roleId, // position 또는 roleId 사용
                enabled: acc.enabled !== undefined ? acc.enabled : true,
            })));
            // 💡 검색 또는 재조회 시 1페이지로 리셋
            setCurrentPage(1); 
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "알 수 없는 에러";
            console.error(`계정 목록 조회에 실패했습니다: ${errorMessage}`);
            setError(`계정 목록 조회에 실패했습니다: ${errorMessage}`);
            setAccounts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

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
                roleId: formData.position,
                storeId: Number(formData.storeId) || null,
                enabled: formData.enabled
            };

            const createdUser = await createAccount(createData);
            // alert(`계정 ${createdUser.userId}가 성공적으로 생성되었습니다.`); // alert 사용 금지
            console.log(`계정 ${createdUser.userId}가 성공적으로 생성되었습니다.`);
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
            position: account.position || account.roleId || '',
        });
        setIsEditModalOpen(true);
    };


    const handleUpdate = async (userId, updateData) => {
        try {
            const updatedUser = await updateAccount(userId, {
                name: updateData.name,
                workspace: updateData.workspace,
                email: updateData.email,
                roleId: updateData.position, 
                storeId: updateData.storeId ? Number(updateData.storeId) : null,
                enabled: updateData.enabled
            });

            // alert(`계정 ${updatedUser.userId}의 정보가 성공적으로 수정되었습니다.`); // alert 사용 금지
            console.log(`계정 ${updatedUser.userId}의 정보가 성공적으로 수정되었습니다.`);
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
        if (!window.confirm(`정말로 계정 ID: ${userId} 를 삭제하시겠습니까?`)) { // confirm 대신 모달 사용 권장
            return;
        }

        try {
            await deleteAccount(userId);
            // alert(`계정 ID: ${userId} 가 성공적으로 삭제되었습니다.`); // alert 사용 금지
            console.log(`계정 ID: ${userId} 가 성공적으로 삭제되었습니다.`);
            
            const newAccounts = accounts.filter(acc => acc.userId !== userId);
            setAccounts(newAccounts);

            // 💡 삭제 후 현재 페이지의 계정 수가 0이 되면 이전 페이지로 이동 (페이징 유지)
            const currentTotalPages = Math.ceil(newAccounts.length / accountsPerPage);
            if (currentPage > currentTotalPages) {
                setCurrentPage(currentTotalPages > 0 ? currentTotalPages : 1);
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "알 수 없는 에러";
            setError(`계정 삭제 실패: ${errorMessage}`);
        }
    };
    
    // =======================================================
    // 💡 [페이징 계산 로직]
    // =======================================================
    const indexOfLastAccount = currentPage * accountsPerPage;
    const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
    // 현재 페이지에 표시할 계정 목록
    const currentAccounts = accounts.slice(indexOfFirstAccount, indexOfLastAccount);

    const totalPages = Math.ceil(accounts.length / accountsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // 💡 [페이지네이션 컨트롤 컴포넌트] (CSS 사용 금지 요청에 따라 인라인 스타일 사용)
    const PaginationControls = () => {
        if (totalPages <= 1) return null;

        // 표시할 페이지 번호 배열 생성
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '5px' }}>
                <button 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    style={{ padding: '8px', border: '1px solid #ccc', cursor: 'pointer', borderRadius: '4px' }}
                >
                    &lt; 이전
                </button>
                {pageNumbers.map(number => (
                    <button 
                        key={number} 
                        onClick={() => paginate(number)} 
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            // 현재 페이지 강조를 위한 최소한의 인라인 스타일
                            backgroundColor: currentPage === number ? '#007bff' : 'white', 
                            color: currentPage === number ? 'white' : 'black',
                            fontWeight: currentPage === number ? 'bold' : 'normal',
                        }}
                    >
                        {number}
                    </button>
                ))}
                <button 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    style={{ padding: '8px', border: '1px solid #ccc', cursor: 'pointer', borderRadius: '4px' }}
                >
                    다음 &gt;
                </button>
            </div>
        );
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

            {isLoading && <div className="flex justify-center items-center min-h-[150px]"> <MiniLoader message="지점 정보를 불러오는 중..." /></div>}

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
                            {/* 💡 [currentAccounts]로 데이터 변경 */}
                            {currentAccounts.length > 0 ? (
                                currentAccounts.map((account) => (
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
            
            {/* 💡 [페이지네이션 컨트롤 표시] */}
            {!isLoading && accounts.length > 0 && <PaginationControls />} 


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