import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AccountCreateModal from '../modals/AccountCreateModal';
import AccountEditModal from '../modals/AccountEditModal';

const API_URL = '/api/admin/users';

// 💡 경고/확인 메시지 출력을 위한 임시 함수 (alert/confirm 대체)
const showMessage = (message, isConfirm = false) => {
    console.log(`[Message Box] ${message}`);
    if (isConfirm) {
        // 실제 환경에서는 사용자 정의 모달을 띄워야 합니다.
        // 현재는 콘솔 메시지로 대체하며, true를 반환하여 작업을 진행합니다.
        return true; 
    }
    // 실제 환경에서는 사용자 정의 모달을 띄워야 합니다.
};


const AccountManage = () => {
    // ⭐️ 상태 관리
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // 💡 백엔드에서 계정 목록을 불러오는 함수
    const fetchAccounts = useCallback(async (currentSearchTerm = '') => {
        setIsLoading(true);
        try {
            const params = currentSearchTerm ? { search: currentSearchTerm } : {};
            const response = await axios.get(API_URL, { params });
            
            // API 응답 구조에 맞게 배열을 추출합니다.
            const accountList = response.data.data || response.data; 

            if (Array.isArray(accountList)) {
                setAccounts(accountList);
            } else {
                // 응답이 객체나 null인 경우 안전하게 빈 배열로 설정합니다.
                console.error("API 응답 구조 오류: 배열이 아닌 데이터를 받았습니다.", response.data);
                setAccounts([]); 
            }

        } catch (error) {
            console.error('계정 목록 불러오기 실패:', error.response || error);
            const message = error.response?.data?.message || '계정 목록을 불러오는 데 실패했습니다.';
            showMessage(`오류: ${message}`);
            setAccounts([]); // 실패 시에도 안전하게 빈 배열로 설정
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 💡 searchTerm이 변경될 때마다 API 호출 (검색 기능)
    useEffect(() => {
        // 실제 운영 환경에서는 debounce를 적용하여 API 호출 빈도를 줄이는 것이 좋습니다.
        fetchAccounts(searchTerm);
    }, [searchTerm, fetchAccounts]);

    // ⭐️ 모달 열기/닫기 함수
    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => setIsCreateModalOpen(false);

    const openEditModal = (account) => {
        setEditingAccount(account);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setEditingAccount(null);
        setIsEditModalOpen(false);
    };

    // ⭐️ 계정 생성 처리 함수 (API 연동)
    const handleCreateAccount = async (newAccountData) => {
        try {
            const response = await axios.post(API_URL, newAccountData);
            showMessage(`계정 '${response.data.accountId}' 생성 완료!`);
            // 생성 후, 현재 검색어 기준으로 목록을 다시 불러옴
            fetchAccounts(searchTerm); 
            closeCreateModal();
        } catch (error) {
            console.error('계정 생성 실패:', error);
            const message = error.response?.data?.message || '계정 생성에 실패했습니다.';
            showMessage(`오류: ${message}`);
        }
    };

    // ⭐️ 계정 수정 처리 함수 (API 연동)
    const handleEditAccount = async (updatedAccountData) => {
        const { id, ...dataToSend } = updatedAccountData;
        try {
            await axios.put(`${API_URL}/${id}`, dataToSend);
            
            // 성공 시, 로컬 상태만 업데이트하여 UX 개선
            setAccounts(prevAccounts =>
                prevAccounts.map(account =>
                    account.id === id ? { ...account, ...dataToSend } : account
                )
            );
            showMessage(`계정 ID ${id} 수정 완료!`);
            closeEditModal();
        } catch (error) {
            console.error('계정 수정 실패:', error);
            const message = error.response?.data?.message || '계정 수정에 실패했습니다.';
            showMessage(`오류: ${message}`);
        }
    };

    // ⭐️ 계정 삭제 처리 함수 (API 연동)
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) {
            showMessage('삭제할 계정을 선택해주세요.');
            return;
        }

        // 💡 window.confirm 대신 커스텀 메시지 함수 사용
        const isConfirmed = showMessage(`${selectedIds.length}개의 계정을 정말 삭제하시겠습니까?`, true); 

        if (isConfirmed) {
            try {
                // 백엔드 구현에 따라, DELETE 요청의 본문에 ID 목록을 담아 보냅니다.
                await axios.delete(`${API_URL}/batch`, {
                    data: { ids: selectedIds }
                });

                // 성공 시, 로컬 상태 업데이트 및 선택 초기화
                setAccounts(prevAccounts => prevAccounts.filter(account => !selectedIds.includes(account.id)));
                setSelectedIds([]);
                showMessage(`${selectedIds.length}개의 계정이 삭제되었습니다.`);
            } catch (error) {
                console.error('계정 삭제 실패:', error);
                const message = error.response?.data?.message || '계정 삭제에 실패했습니다.';
                showMessage(`오류: ${message}`);
            }
        }
    };

    // ⭐️ 체크박스 선택 처리
    const handleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // ⭐️ 전체 선택/해제
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // accounts가 배열이 아닐 경우를 대비하여 안전 검사
            setSelectedIds((Array.isArray(accounts) ? accounts : []).map(account => account.id));
        } else {
            setSelectedIds([]);
        }
    };
    
    return (
        <div className="account-manage-container">
            <h1>계정 관리</h1>

            <div className="search-area">
                <input
                    type="text"
                    placeholder="계정 검색 (ID, 이름, 점포 등)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={() => fetchAccounts(searchTerm)}>새로고침/검색</button> 
            </div>

            <div className="action-buttons">
                <button onClick={openCreateModal} className="create-btn">생성</button>
                <button onClick={handleDeleteSelected} className="delete-btn" disabled={selectedIds.length === 0}>삭제</button>
            </div>

            <table className="account-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={selectedIds.length === accounts.length && accounts.length > 0}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>ID</th>
                        <th>아이디</th>
                        <th>이름</th>
                        <th>직급</th>
                        <th>점포 ID</th>
                        <th>이메일</th>
                        <th>액션</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center' }}>데이터를 불러오는 중입니다...</td>
                        </tr>
                    ) : (accounts && accounts.length === 0) ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center' }}>검색 결과 또는 등록된 계정이 없습니다.</td>
                        </tr>
                    ) : (
                        // 🚨 안전 장치 적용: 배열이 아닐 경우 빈 배열로 대체 (이전 오류 해결)
                        // 💡 불규칙한 공백 정리 완료
                        (Array.isArray(accounts) ? accounts : []).map((account) => (
                            <tr key={account.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(account.id)}
                                        onChange={() => handleSelect(account.id)}
                                    />
                                </td>
                                <td>{account.id}</td>
                                <td>{account.accountId}</td>
                                <td>{account.name}</td>
                                <td>{account.position}</td>
                                <td>{account.storeId}</td>
                                <td>{account.email}</td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => openEditModal(account)}
                                    >
                                        수정
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* AccountCreateModal 및 AccountEditModal은 외부에서 정의되었다고 가정하고 렌더링합니다. */}
            <AccountCreateModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                onCreate={handleCreateAccount}
            />

            {editingAccount && (
                <AccountEditModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSave={handleEditAccount}
                    accountData={editingAccount}
                />
            )}
        </div>
    );
};

export default AccountManage;
