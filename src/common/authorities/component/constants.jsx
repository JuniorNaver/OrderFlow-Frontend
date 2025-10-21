/**
 * src/common/authorities/component/constants.jsx
 * 역할(ROLE) ID 및 권한 매핑을 정의합니다.
 * 실제 백엔드 enum/DB 값과 일치해야 합니다.
 */

// 1. 역할 (ROLE) 정의
export const ROLES = {
    ADMIN: { id: 'ROLE_ADMIN', name: '최고 관리자' },
    MANAGER: { id: 'ROLE_MANAGER', name: '점장' },
    CLERK: { id: 'ROLE_CLERK', name: '점원' },
};

// 2. 역할별 기본 권한 정의 (백엔드 기본 정책 또는 초기값)
// po: 발주, stk: 재고관리, sd: 영업, bi: BI/분석
export const PERMISSIONS = {
    // 최고 관리자는 모든 권한을 가집니다 (수정 불가)
    ADMIN: { po: true, stk: true, sd: true, bi: true },
    
    // 점장 권한 (예시)
    MANAGER: { po: true, stk: true, sd: true, bi: false },
    
    // 점원 권한 (예시)
    CLERK: { po: false, stk: true, sd: true, bi: false },
};

// 모든 권한 키 목록
export const ALL_PERMISSION_KEYS = ['po', 'stk', 'sd', 'bi'];