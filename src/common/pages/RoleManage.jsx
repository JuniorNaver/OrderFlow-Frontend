import React, { useState, useEffect, useCallback } from 'react';
import { Save, X, Settings, RefreshCcw, Loader2 } from 'lucide-react'; 
import '../style/RoleManage.css';

// API 기본 URL (실제 백엔드 주소로 변경 필요)
const API_BASE_URL = 'http://localhost:8080/api/admin/roles/permissions';

// 권한 목록 정의 (백엔드의 Authority/Permission 키와 매칭되어야 함)
const PERMISSIONS = [
    { key: 'PO', name: '발주 (PO)' },   // Purchase Order
    { key: 'PR', name: '조달 (PR)' },   // Purchase Request
    { key: 'STK', name: '재고관리 (STK)' }, // Stock Management
    { key: 'SD', name: '영업 (SD)' },   // Sales & Distribution
    { key: 'BI', name: 'BI (분석)' },   // Business Intelligence
];

// 초기 더미 데이터 (로딩 실패 시 임시 사용)
const FALLBACK_ROLES = [
    { roleId: 'ROLE_ADMIN', position: '최고 관리자', permissions: { PO: true, PR: true, STK: true, SD: true, BI: true } },
    { roleId: 'ROLE_MANAGER', position: '점장', permissions: { PO: true, PR: true, STK: true, SD: true, BI: false } },
    { roleId: 'ROLE_CLERK', position: '점원', permissions: { PO: false, PR: false, STK: true, SD: true, BI: false } },
];


const RoleManager = () => {
    const [roles, setRoles] = useState([]);
    const [originalRoles, setOriginalRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // 1. 데이터 조회 (GET) - 컴포넌트 마운트 시
    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setMessage('');
        try {
            // 실제 API 호출 (GET /api/admin/roles/permissions)
            const response = await fetch(API_BASE_URL, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!Array.isArray(data) || data.length === 0) {
                 setRoles(FALLBACK_ROLES);
                 setOriginalRoles(FALLBACK_ROLES);
                 setMessage('⚠️ 백엔드에서 데이터를 가져오지 못하여 더미 데이터를 사용합니다.');
                 return;
            }

            setRoles(data);
            setOriginalRoles(data);

        } catch (error) {
            console.error("Failed to fetch roles:", error);
            setRoles(FALLBACK_ROLES);
            setOriginalRoles(FALLBACK_ROLES);
            setMessage('❌ 데이터 로딩 중 오류 발생. 더미 데이터를 사용합니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    // 2. 역할(권한) 토글 함수
    const handleToggleRole = useCallback((roleId, permissionKey) => {
        setRoles(prevRoles =>
            prevRoles.map(role =>
                role.roleId === roleId
                    ? {
                        ...role,
                        permissions: {
                            ...role.permissions,
                            [permissionKey]: !role.permissions[permissionKey]
                        }
                    }
                    : role
            )
        );
    }, []);

    // 변경사항이 있는지 확인하는 함수
    const hasChanges = roles.some((role, index) =>
        JSON.stringify(role.permissions) !== JSON.stringify(originalRoles[index]?.permissions)
    );

    // 3. 저장 함수 (PUT) - 일괄 업데이트 API 호출
    const handleSave = async () => {
        if (isSaving || !hasChanges) return;

        setIsSaving(true);
        setMessage('백엔드 서버로 권한 변경 내용을 전송 중...');
        
        const updatePayload = roles.map(role => ({
            roleId: role.roleId,
            permissions: role.permissions
        }));

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });

            if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
            }

            setOriginalRoles(roles); 
            setMessage('✅ 권한 설정이 성공적으로 저장되었습니다.');

        } catch (error) {
            console.error("Error saving roles:", error);
            setMessage('❌ 권한 저장 중 오류가 발생했습니다. 자세한 내용은 콘솔을 확인하세요.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    // 4. 취소 함수
    const handleCancel = () => {
        if (isSaving) return;
        setRoles(originalRoles);
        setMessage('변경 사항이 취소되었습니다.');
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) {
         return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="ml-3 text-lg font-medium text-gray-700">권한 데이터를 로딩 중입니다...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-xl p-6 md:p-10">
                <header className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        <Settings className="w-7 h-7 mr-3 text-indigo-600" />
                        역할별 권한 관리
                    </h1>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 shadow-md ${
                                isSaving || !hasChanges 
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-[1.02]'
                            }`}
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {isSaving ? '전송 중...' : '변경 사항 저장'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isSaving || !hasChanges}
                            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 shadow-md border ${
                                isSaving || !hasChanges 
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transform hover:scale-[1.02]'
                            }`}
                        >
                            <X className="w-4 h-4 mr-2" />
                            취소
                        </button>
                    </div>
                </header>
                
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                        message.includes('성공') ? 'bg-green-100 text-green-700 border border-green-300' : 
                        message.includes('오류') ? 'bg-red-100 text-red-700 border border-red-300' :
                        'bg-blue-100 text-blue-700 border border-blue-300'
                    }`}>
                        {message}
                    </div>
                )}

                <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할명</th>
                                {PERMISSIONS.map(p => (
                                    <th key={p.key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        {p.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roles.map(role => (
                                <tr key={role.roleId} className="hover:bg-indigo-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.roleId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-800">{role.position}</td>
                                    
                                    {PERMISSIONS.map(p => (
                                        <td key={p.key} className="px-6 py-4 whitespace-nowrap text-center">
                                            {/* 커스텀 토글 스위치 (RoleManager.css 사용) */}
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={!!role.permissions[p.key]}
                                                    onChange={() => handleToggleRole(role.roleId, p.key)}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                    <RefreshCcw className="w-3 h-3 inline mr-1 text-gray-400" />
                    데이터 로딩 및 저장은 백엔드 <code className="font-mono text-xs bg-gray-200 px-1 rounded">/api/admin/roles/permissions</code> 엔드포인트를 사용합니다.
                </p>
            </div>
        </div>
    );
};

export default RoleManager;