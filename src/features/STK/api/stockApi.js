// src/features/STK/api/stockApi.js (불필요한 공백 및 숨은 문자 제거)

import axios from 'axios';

// BASE URL 설정 (로컬 서버 8080 가정)
const BASE_URL = 'http://localhost:8080/api/stk'; 


/**
 * 1. 전체 재고 현황 목록을 조회합니다.
 */
export const fetchStockStatusList = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/list/all`);
        return response.data;
    } catch (error) {
        console.error("API 호출 실패: /list/all", error);
        // Mock 데이터 반환
        return ([ 
            { name: '콜라 500ml (Mock)', warehouseId: 'W001', quantity: 100 },
            { name: '사이다 500ml (Mock)', warehouseId: 'W002', quantity: 250 },
        ]);
    }
};


/**
 * 2. 위치 변경 필요 재고 목록을 조회합니다.
 * 백엔드 API 시그니처: GET /stk/list/relocation-required?warehouseId={id}
 */
export const fetchRelocationList = async (warehouseId) => { 
    try {
        // 경로를 백엔드 컨트롤러에 맞춰 /list/relocation-required로 사용
        const response = await axios.get(`${BASE_URL}/list/relocation-required`, { 
            params: { warehouseId } 
        }); 
        return response.data;
    } catch (error) {
        console.error("API 호출 실패: /list/relocation-required", error);
        // Mock 데이터 반환
        return ([ 
            { lotId: 101, stkId: 201, productGtin: '01234567', productName: '냉장제품A (Mock)', 
              warehouseId: 'W001', expiryDate: '2025-11-01', quantity: 50, 
              issueReason: 'FIFO 위배: 뒤 재고 수량 많음' },
            { lotId: 102, stkId: 202, productGtin: '01234568', productName: '실온제품B (Mock)', 
              warehouseId: 'W001', expiryDate: '2025-10-25', quantity: 100, 
              issueReason: 'FIFO 위배: 뒤 재고 수량 많음' },
        ]);
    }
};


/**
 * 3. 창고 적재 용량 현황 데이터를 조회합니다.
 */
export const fetchCapacityStatus = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/status/capacity`);
        return response.data; 
    } catch (error) {
        console.error("API 호출 실패: /status/capacity", error);
        return ({ total: 1000, current: 780, unit: 'CBM' }); 
    }
};


/**
 * 4. 만료 임박 재고 현황 데이터를 조회합니다.
 */
export const fetchExpiryStatus = async (days = 90) => {
    try {
        const response = await axios.get(`${BASE_URL}/status/expiry`, {
            params: { days }
        });
        return response.data; // ProgressStatusDTO 반환
    } catch (error) {
        console.error(`API 호출 실패: /status/expiry (기준일: ${days}일)`, error);
        // Mock 데이터를 반환합니다.
        return ({ total: 5000, current: 1275, unit: '개' }); 
    }
};

/**
 * 5. 폐기 예정 재고 (유통기한 만료된 활성 재고) 목록을 조회합니다.
 */
export const fetchDisposalList = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/list/expired`);
        return response.data; 
    } catch (error) {
        console.error("API 호출 실패: /list/expired (폐기 예정)", error);
        // Mock 데이터를 반환합니다.
        return ([ 
            { productName: '치즈케이크', expiryDate: '2025-10-15', quantity: 5 }, 
            { productName: '딸기잼 500g', expiryDate: '2025-09-20', quantity: 10 },
        ]);
    }
};

/**
 * 6. GTIN(바코드)을 이용해 해당 제품의 모든 활성 재고 랏(Lot)을 조회합니다.
 * 404 오류 해결을 위해 경로를 /list/gtin으로 수정했습니다.
 */
export const fetchStockByGtin = async (gtin) => {
    try {
        // 백엔드와 일치하도록 경로 수정: /stock/gtin -> /list/gtin
        const response = await axios.get(`${BASE_URL}/list/gtin`, {
            params: { gtin }
        });
        return response.data; // Lot 정보 리스트를 반환
    } catch (error) {
        console.error(`API 호출 실패: /list/gtin (GTIN: ${gtin})`, error); // 로그 메시지도 수정
        
        // Mock 데이터를 반환합니다.
        return ([ 
            { lotId: 'LOT12345', productName: `스캔된 제품 (${gtin})`, location: 'A-01-01', expiryDate: '2026-05-20', quantity: 150, disposalQuantity: 0 },
            { lotId: 'LOT12346', productName: `스캔된 제품 (${gtin})`, location: 'B-02-05', expiryDate: '2025-12-10', quantity: 80, disposalQuantity: 0 },
        ]);
    }
};

/**
 * 7. 최종 폐기 요청을 서버에 전송하고 재고를 처리합니다.
 * 백엔드 API: POST /stk/disposal/execute
 * @param {DisposalRequest} requestDTO 폐기 요청 목록 (lotId, quantity 포함)
 */
export const executeDisposal = async (requestDTO) => {
    try {
        const response = await axios.post(`${BASE_URL}/disposal/execute`, requestDTO);
        return response.data; // 처리된 STK 목록 반환
    } catch (error) {
        console.error("API 호출 실패: /disposal/execute", error);
        throw error; // 오류를 다시 던져서 컴포넌트에서 처리하도록 합니다.
    }
};