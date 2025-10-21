import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RefreshCcw, Save, X } from 'lucide-react'; 
// ✅ 경로 수정: RoleManage.jsx (pages)에서 constants.jsx (component)로 이동
import { PERMISSIONS, ROLES } from '../component/constants'; 
// 🔑 인증 토큰을 가져오기 위해 useAuth 훅 import
import { useAuth } from '../component/useAuth'; // (프로젝트 구조에 맞게 수정 필요)

// 백엔드 AdminRoleController와 일치하는 경로
const API_URL = '/api/admin/roles/permissions';

// UI에 표시될 권한 필드 이름 매핑
const PERMISSION_KEYS = [
    { key: 'po', label: '발주 (PO)' },
    { key: 'stk', label: '재고관리 (STK)' },
    { key: 'sd', label: '영업 (SD)' },
    { key: 'bi', label: 'BI/분석' },
];

/**
 * 역할별 권한 관리 페이지 컴포넌트
 */
const RoleManage = () => {
    const [originalPermissions, setOriginalPermissions] = useState([]);
    const [currentPermissions, setCurrentPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState({ message: '', type: '' });
    
    // 🔑 useAuth 훅에서 JWT 토큰을 가져옵니다.
    const { token } = useAuth(); 

    // 권한 목록 조회
    const fetchPermissions = useCallback(async () => {
        // 토큰이 없으면 API 요청을 시도하지 않고 에러 상태 설정
        if (!token) {
            setStatus({ message: '오류: 사용자 인증 토큰이 없습니다. 로그인 상태를 확인하세요.', type: 'error' });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setStatus({ message: '', type: '' });
        try {
            // 🔑 인증 헤더 설정
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            };
            
            // 🔑 토큰을 포함하여 API 호출
            const response = await axios.get(API_URL, config);
            
            // ✅ 데이터 구조 오류 수정: 백엔드가 배열을 직접 반환하므로 response.data 사용
            const permissionArray = response.data;
            
            if (!Array.isArray(permissionArray)) {
                // 이 에러는 이제 서버가 HTML이 아닌 유효한 JSON을 반환할 때만 나타나야 합니다.
                console.error("API 응답 구조 오류: 예상된 배열이 아닙니다.", response.data);
                setStatus({ message: '데이터 로드 실패: 서버 응답이 유효한 목록 형태가 아닙니다.', type: 'error' });
                setIsLoading(false);
                return;
            }

            // ROLE_ADMIN 정보 (상수에서 가져온 최고 관리자)
            const adminRole = { 
                roleId: ROLES.ADMIN.id, 
                roleName: ROLES.ADMIN.name, 
                ...PERMISSIONS.ADMIN 
            };
            
            // 응답 데이터를 UI에 필요한 형태로 가공
            const fetchedData = permissionArray.map(item => ({
                ...item,
                roleName: ROLES[item.roleId.replace('ROLE_', '')]?.name || item.roleId
            }));

            // 최종 목록 (ADMIN을 목록의 맨 앞에 고정)
            const finalPermissions = [adminRole, ...fetchedData.filter(item => item.roleId !== ROLES.ADMIN.id)];

            setOriginalPermissions(finalPermissions);
            setCurrentPermissions(finalPermissions);
            setStatus({ message: '최신 권한 데이터 로드 완료', type: 'success' });
        } catch (error) {
            console.error('권한 조회 실패:', error.response || error);
            
            // 🔑 인증 및 권한 실패 시 오류 메시지
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setStatus({ message: '인증/권한 오류: 관리자 권한이 없거나 로그인이 만료되었습니다. (403/401)', type: 'error' });
            } else {
                setStatus({ message: '오류: 데이터 로드 실패, 서버 연결 또는 알 수 없는 문제.', type: 'error' });
            }
        } finally {
            setIsLoading(false);
        }
    }, [token]); // token이 변경될 때마다 함수가 재생성되어야 합니다.

    useEffect(() => {
        // 토큰이 있을 때만 fetchPermissions 실행
        if (token) {
            fetchPermissions();
        } else if (isLoading) {
            // 토큰이 없어서 fetchPermissions가 실행되지 않았다면 로딩 상태 해제
            setIsLoading(false);
        }
    }, [fetchPermissions, token, isLoading]); // token을 dependency에 추가

    // 토글 스위치 변경 핸들러 (생략되지 않음)
    const handleToggle = (roleId, permissionKey) => {
        // ROLE_ADMIN의 권한은 변경할 수 없음
        if (roleId === ROLES.ADMIN.id) return;

        setCurrentPermissions(prev => prev.map(role => 
            role.roleId === roleId 
                ? { ...role, [permissionKey]: !role[permissionKey] } 
                : role
        ));
    };

    // 변경 사항 저장 핸들러 (PUT /api/admin/roles/permissions)
    const handleSave = async () => {
        if (!token) {
            setStatus({ message: '오류: 사용자 인증 토큰이 없습니다. 로그인 상태를 확인하세요.', type: 'error' });
            return;
        }

        setIsLoading(true);
        setStatus({ message: '변경 사항 저장 중...', type: 'info' });

        const updateDtos = currentPermissions
            .filter(role => role.roleId !== ROLES.ADMIN.id) 
            .map(role => ({
                roleId: role.roleId,
                permissions: PERMISSION_KEYS.reduce((acc, p) => {
                    acc[p.key] = role[p.key];
                    return acc;
                }, {})
            }));
        
        // 🔑 인증 헤더 설정 (저장 시에도 필요)
        const config = {
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        };

        try {
            // PUT 요청 시, List<RolePermissionUpdateDto> 배열을 전송
            await axios.put(API_URL, updateDtos, config); 
            
            // 성공 시 원본 데이터 업데이트 및 재조회
            await fetchPermissions();
            setStatus({ message: '권한 변경 사항이 성공적으로 저장되었습니다.', type: 'success' });

        } catch (error) {
            console.error('권한 저장 실패:', error.response || error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                 setStatus({ message: '저장 실패: 관리자 권한이 없거나 로그인이 만료되었습니다.', type: 'error' });
            } else {
                 setStatus({ message: '권한 저장에 실패했습니다. (서버 오류)', type: 'error' });
            }
            setIsLoading(false);
        }
    };

    // 변경 사항 취소 핸들러 (생략되지 않음)
    const handleCancel = () => {
        setCurrentPermissions(originalPermissions);
        setStatus({ message: '변경 사항이 취소되고 원본 데이터로 복원되었습니다.', type: 'info' });
    };

    // 변경 여부 확인 (ADMIN 제외한 데이터 비교)
    const isDirty = JSON.stringify(originalPermissions.filter(r => r.roleId !== ROLES.ADMIN.id)) !== 
                    JSON.stringify(currentPermissions.filter(r => r.roleId !== ROLES.ADMIN.id));

    // 상태 메시지 UI 렌더링 (생략되지 않음)
    const StatusMessage = ({ message, type }) => {
        if (!message) return null;
        const base = "p-3 rounded-lg text-sm mb-4 flex items-center";
        const style = {
            success: "bg-green-100 text-green-700 border border-green-300",
            error: "bg-red-100 text-red-700 border border-red-300",
            info: "bg-blue-100 text-blue-700 border border-blue-300",
        };
        return (
            <div className={`${base} ${style[type]}`}>
                {type === 'error' && <span className="font-bold mr-2">❌ 오류:</span>}
                {type === 'info' && <span className="font-bold mr-2">ℹ️ 알림:</span>}
                {message}
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-6 border-b pb-3">
                <span className="mr-3 text-indigo-600"><RefreshCcw size={28} /></span>
                역할별 권한 관리
            </h1>
            
            <StatusMessage message={status.message} type={status.type} />
            
            {/* 액션 버튼 그룹 */}
            <div className="flex justify-end space-x-3 mb-6">
                <button
                    onClick={handleSave}
                    disabled={!isDirty || isLoading || !token}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${
                        isDirty && !isLoading && token
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <Save size={18} />
                    <span>변경 사항 저장</span>
                </button>
                <button
                    onClick={handleCancel}
                    disabled={!isDirty || isLoading}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${
                        isDirty && !isLoading
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <X size={18} />
                    <span>취소</span>
                </button>
                <button
                    onClick={fetchPermissions}
                    disabled={isLoading || !token}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150"
                >
                    <RefreshCcw size={18} />
                    <span>새로고침</span>
                </button>
            </div>
            
            {/* 권한 테이블 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                                ROLE ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                                역할명
                            </th>
                            {PERMISSION_KEYS.map(p => (
                                <th key={p.key} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    {p.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading && token ? (
                             <tr>
                                <td colSpan={2 + PERMISSION_KEYS.length} className="text-center py-8 text-indigo-600 font-medium">
                                    데이터 로딩 중...
                                </td>
                            </tr>
                        ) : (
                            currentPermissions.map((role) => (
                                <tr key={role.roleId} className={role.roleId === ROLES.ADMIN.id ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.roleId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{role.roleName}</td>
                                    
                                    {PERMISSION_KEYS.map(p => (
                                        <td key={p.key} className="px-6 py-4 whitespace-nowrap text-sm">
                                            {/* 토글 스위치 (Admin 권한은 disabled) */}
                                            <label className={`relative inline-flex items-center cursor-pointer ${role.roleId === ROLES.ADMIN.id ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={role[p.key]}
                                                    onChange={() => handleToggle(role.roleId, p.key)}
                                                    disabled={role.roleId === ROLES.ADMIN.id}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-sm text-gray-500 p-4 border-t border-gray-200">
                **참고:**
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>데이터 조회 및 저장은 백엔드 엔드포인트 `/api/admin/roles/permissions`를 사용합니다.</li>
                    <li>**{ROLES.ADMIN.name}** 권한은 정책상 변경할 수 없으며, 모든 권한이 **활성화**됩니다.</li>
                </ul>
            </div>
        </div>
    );
};

export default RoleManage;