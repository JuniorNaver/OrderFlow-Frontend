// src/features/STK/api/stockApi.js

import axios from 'axios';

// BASE URL 설정 (로컬 서버 8080 가정)
const BASE_URL = 'http://localhost:8080/api/stk'; 


/**
 * 1. 전체 재고 현황 목록을 조회합니다. (StockStatus.jsx 사용)
 */
export const fetchStockStatusList = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/list/all`);
        return response.data;
    } catch (error) {
        console.error("API 호출 실패: /list/all", error);
        // API 호출 실패 시 Mock 데이터 반환 (Postman DTO 형식)
        return ([ 
            { name: '콜라 500ml (Mock)', warehouseId: 'W001', quantity: 100 },
            { name: '사이다 500ml (Mock)', warehouseId: 'W002', quantity: 250 },
        ]);
    }
};


/**
 * 2. 위치 변경 필요 재고 목록을 조회합니다. (RelocationRequired.jsx 사용)
 * Uncaught SyntaxError (Unexpected token 'try') 오류를 해결하기 위해 중괄호와 return을 명시했습니다.
 */
export const fetchRelocationList = async () => { 
    try {
        const response = await axios.get(`${BASE_URL}/list/relocation`);
        return response.data;
    } catch (error) {
        console.error("API 호출 실패: /list/relocation", error);
        // 임시 Mock 데이터 반환
        return ([ 
            { name: '냉장제품A (Mock)', location: 'R-01-01', quantity: '50 EA' },
            { name: '실온제품B (Mock)', location: 'T-05-12', quantity: '100 EA' },
        ]);
    }
};


/**
 * 3. 창고 적재 용량 현황 데이터를 조회합니다. (CurrentStockDashboard.jsx 사용)
 */
// ⭐️ export 활성화 (이전 오류 해결)
export const fetchCapacityStatus = async () => {
    // 실제 API 호출 로직은 주석 처리하고 Mock 데이터를 바로 반환합니다.
    /* try {
        const response = await axios.get(`${BASE_URL}/status/capacity`);
        return response.data;
    } catch (error) {
        console.error("API 호출 실패: /status/capacity", error);
        return ({ total: 1000, current: 0, unit: 'CBM' }); 
    } */
    
    // Mock 데이터를 바로 반환
    return ({ total: 1000, current: 780, unit: 'CBM' }); 
};


/**
 * 4. 만료 임박 재고 현황 데이터를 조회합니다. (ExpiryDashboard.jsx 사용)
 */
// ⭐️ export 활성화 (이전 오류 해결)
export const fetchExpiryStatus = async () => {
    // 실제 API 호출 로직은 주석 처리하고 Mock 데이터를 바로 반환합니다.
    /* try {
        const response = await axios.get(`${BASE_URL}/status/expiry`);
        return response.data;
    } catch (error) {
        console.error("API 호출 실패: /status/expiry", error);
        return ({ total: 5000, current: 0, unit: '개' }); 
    } */

    // Mock 데이터를 바로 반환
    return ({ total: 5000, current: 1275, unit: '개' }); 
};

export const fetchDisposalList = async () => {
    // 실제 API 호출 로직을 사용하려면 주석을 해제하고 구현합니다.
    /* try {
        const response = await axios.get(`${BASE_URL}/list/disposal`);
        return response.data;
    } catch (error) {
        console.error("API 호출 실패: /list/disposal", error);
        return ([ 
            { no: 1, name: '폐기물A (Mock)', price: 3000, stock: 5 },
            { no: 2, name: '폐기물B (Mock)', price: 1300, stock: 10 },
        ]);
    } */

    // Mock 데이터를 바로 반환
    return ([ // 임시 Mock 반환 (DUMMY_DISPOSAL_DATA)
        { no: 1, name: '햇반(100g) 01584123', price: 3000, stock: 5 },
        { no: 2, name: '컵라면A 01584123', price: 1300, stock: 10 },
    ]);
};