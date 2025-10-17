import React, { useState } from 'react';
import AccountCreateModal from '../modals/AccountCreateModal';
import AccountEditModal from '../modals/AccountEditModal'; // ⭐️ 1. 수정 팝업 임포트
import '../styles/AccountManage.css';

// 임시 데이터 (실제로는 API에서 가져옵니다)
const DUMMY_ACCOUNTS = [
  { id: 1, accountId: 'rlarudslah', name: '김정도', position: '점장', storeId: '영우 3지점', email: 'rlarudslah@naver.com' },
  { id: 2, accountId: 'rladlala1', name: '김성민', position: '점원', storeId: '선달 1지점', email: 'rladlala1@gmail.com' },
  { id: 3, accountId: 'chlwndud', name: '박준혁', position: '점장', storeId: '다복 2지점', email: 'chlwndud@naver.com' },
];

const AccountManage = () => {
  // ⭐️ 상태 관리
  const [accounts, setAccounts] = useState(DUMMY_ACCOUNTS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // 생성 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // ⭐️ 2. 수정 모달 상태
  const [editingAccount, setEditingAccount] = useState(null); // ⭐️ 3. 수정할 계정 정보
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // ⭐️ 모달 열기/닫기 함수
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (account) => { // ⭐️ 4. 수정 모달 열기 함수
    setEditingAccount(account);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => { // ⭐️ 5. 수정 모달 닫기 함수
    setEditingAccount(null);
    setIsEditModalOpen(false);
  };

  // ⭐️ 계정 생성 처리 함수
  const handleCreateAccount = (newAccountData) => {
    console.log('새 계정 생성 데이터:', newAccountData);
    const newId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
    const newAccount = { id: newId, ...newAccountData };
    setAccounts((prevAccounts) => [...prevAccounts, newAccount]);
    closeCreateModal();
  };

  // ⭐️ 6. 계정 수정 처리 함수
  const handleEditAccount = (updatedAccountData) => {
    setAccounts(prevAccounts => 
      prevAccounts.map(account =>
        account.id === updatedAccountData.id ? { ...account, ...updatedAccountData } : account
      )
    );
    closeEditModal();
  };

  // ⭐️ 계정 삭제 처리 함수
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      alert('삭제할 계정을 선택해주세요.');
      return;
    }
    
    if (window.confirm(`${selectedIds.length}개의 계정을 정말 삭제하시겠습니까?`)) {
      setAccounts(accounts.filter(account => !selectedIds.includes(account.id)));
      setSelectedIds([]);
    }
  };

  // ⭐️ 체크박스 선택 처리
  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // ⭐️ 전체 체크박스 선택/해제 처리
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(accounts.map(account => account.id));
    } else {
      setSelectedIds([]);
    }
  };

  // ⭐️ 검색 기능 (필터링)
  const filteredAccounts = accounts.filter(account =>
    Object.values(account).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
        <button>검색</button>
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
          {filteredAccounts.map((account) => (
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
                  onClick={() => openEditModal(account)} // ⭐️ 7. 버튼 클릭 시 수정 모달 열기
                >
                  수정
                </button> 
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ⭐️ 생성 팝업 */}
      <AccountCreateModal 
        isOpen={isCreateModalOpen} 
        onClose={closeCreateModal} 
        onCreate={handleCreateAccount} 
      />

      {/* ⭐️ 8. 수정 팝업 추가 */}
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