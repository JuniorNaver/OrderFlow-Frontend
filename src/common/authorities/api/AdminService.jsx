import ApiClient from "./ApiClient";

const ADMIN_ENDPOINT = '/admin/users';

/**
 * 1. [R] 사용자 계정 목록 조회 및 검색
 * @param {string} search - 검색어 (이름, ID 등)
 * @returns {Promise<Array<Object>>}
 */
export const fetchAccounts = async (search = '') => {
    // GET /api/admin/users 또는 /api/admin/users?search=...
    const url = search ? `${ADMIN_ENDPOINT}?search=${encodeURIComponent(search)}` : ADMIN_ENDPOINT;
    return await ApiClient.get(url);
};

/**
 * 2. [C] 새 사용자 계정 생성
 * @param {Object} userData - UserCreateRequestDTO (userId, password, name, email, workspace, position, storeId)
 * @returns {Promise<Object>} 생성된 사용자 정보
 */
export const createAccount = async (userData) => {
    const payload = {
        ...userData,
        // Long 타입 처리를 위해 Number로 변환하여 전송
        storeId: Number(userData.storeId), 
    };
    // POST /api/admin/users
    return await ApiClient.post(ADMIN_ENDPOINT, payload);
};

/**
 * 3. [U] 사용자 계정 정보 수정
 * @param {string} userId - 수정할 사용자의 ID
 * @param {Object} updateData - UserUpdateRequestDTO (name, email, workspace, position, storeId)
 * @returns {Promise<Object>} 수정된 사용자 정보
 */
export const updateAccount = async (userId, updateData) => {
    const payload = {
        ...updateData,
        // Long 타입 처리를 위해 storeId가 있을 경우 Number로 변환
        storeId: updateData.storeId ? Number(updateData.storeId) : null,
    };
    // PUT /api/admin/users/{userId}
    return await ApiClient.put(`${ADMIN_ENDPOINT}/${userId}`, payload);
};

/**
 * 4. [D] 사용자 계정 삭제
 * @param {string} userId - 삭제할 사용자의 ID
 * @returns {Promise<void>}
 */
export const deleteAccount = async (userId) => {
    // DELETE /api/admin/users/{userId}
    // ApiClient의 응답 인터셉터가 오류를 처리합니다.
    await ApiClient.delete(`${ADMIN_ENDPOINT}/${userId}`);
};
