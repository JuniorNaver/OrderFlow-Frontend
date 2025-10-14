import React, { useState } from 'react';
import '../style/RoleManage.css';

// 임시 역할 데이터
const DUMMY_ROLES = [
    { id: 1, position: '점장', BI: true, PO: true, PR: false, GR: true, STK: true, SD: true },
    { id: 2, position: '점원', BI: false, PO: false, PR: false, GR: false, STK: true, SD: true },
];

const RoleManage = () => {
    const [roles, setRoles] = useState(DUMMY_ROLES);

    // ⭐️ 역할(권한) 토글 함수
    const handleToggleRole = (id, roleKey) => {
        setRoles(prevRoles =>
            prevRoles.map(role =>
                role.id === id ? { ...role, [roleKey]: !role[roleKey] } : role
            )
        );
    };

    return (
        <div className="role-manage-container">
            <h1>역할 관리</h1>
            
            {/* 저장/취소 버튼 그룹 */}
            <div className="button-group top-buttons">
                <button className="save-btn">저장</button>
                <button className="cancel-btn">취소</button>
            </div>

            {/* 역할 목록 테이블 */}
            <table className="role-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" /></th>
                        <th>번호</th>
                        <th>역할</th>
                        <th>발주(PO)</th>
                        <th>조달(PR)</th>
                        <th>재고관리(STK)</th>
                        <th>영업(SD)</th>
                        <th>BI</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map(role => (
                        <tr key={role.id}>
                            <td><input type="checkbox" /></td>
                            <td>{role.id}</td>
                            <td>{role.position}</td>
                            <td className="toggle-cell">
                            {/* ⭐️ 토글 스위치 구조로 변경 */}
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={role.PO} // PO 권한 상태 반영
                                    onChange={() => handleToggleRole(role.id, 'PO')}
                                />
                                <span className="slider round"></span> {/* 슬라이더 바 역할 */}
                            </label>
                            </td>
                            <td className="toggle-cell">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={role.PR} // PR 권한 상태 반영
                                    onChange={() => handleToggleRole(role.id, 'PR')}
                                />
                            <span className="slider round"></span>
                            </label>
                            </td>
                            {/* 💡 나머지 권한(STK, SD, BI)도 동일하게 <label className="switch"> 구조로 변경해야 합니다. */}
                            <td className="toggle-cell">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={role.STK}
                                    onChange={() => handleToggleRole(role.id, 'STK')}
                                />
                                <span className="slider round"></span>
                            </label>
                            </td>
                            <td className="toggle-cell">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={role.SD}
                                    onChange={() => handleToggleRole(role.id, 'SD')}
                                />
                                <span className="slider round"></span>
                            </label>
                            </td>
                            <td className="toggle-cell">
                            <label className="switch">
                            <input
                                type="checkbox"
                                checked={role.BI}
                                onChange={() => handleToggleRole(role.id, 'BI')}
                            />
                            <span className="slider round"></span>
                            </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoleManage;