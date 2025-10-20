// src/features/STK/api/stockApi.js (수정된 최종 코드)

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
 * 백엔드 API 시그니처: GET /stk/relocation-required?warehouseId={id}
 * 백엔드 DTO: StockRelocationRequiredResponse
 */
export const fetchRelocationList = async (warehouseId) => { 
    try {
        const response = await axios.get(`${BASE_URL}/relocation-required`, { 
            params: { warehouseId } 
        }); 
        return response.data;
    } catch (error) {
        console.error("API 호출 실패: /stk/relocation-required", error);
        // DTO 형식에 맞춘 임시 Mock 데이터 반환
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
 * 3. 창고 적재 용량 현황 데이터를 조회합니다. (CurrentStockDashboard.jsx 사용)
 */
// BI 개발 완료 전까지 Mock 데이터를 사용합니다.
export const fetchCapacityStatus = async () => {
    return ({ total: 1000, current: 780, unit: 'CBM' }); 
};


/**
 * 4. 만료 임박 재고 현황 데이터를 조회합니다. (ExpiryDashboard.jsx 사용)
 * ⭐️ days를 인자로 받도록 수정하고, Mock 로직을 주석 처리했습니다.
 * @param {number} days 임박 기준으로 삼을 일 수 (기본값 90일)
 */
export const fetchExpiryStatus = async (days = 90) => {
    try {
        // ⭐️ 실제 API 호출 활성화
        const response = await axios.get(`${BASE_URL}/status/expiry`, {
            params: { days }
        });
        return response.data; // ProgressStatusDTO 반환
    } catch (error) {
        console.error(`API 호출 실패: /status/expiry (기준일: ${days}일)`, error);
        // API 호출 실패 시 Mock 데이터를 반환합니다.
        return ({ total: 5000, current: 1275, unit: '개' }); 
    }
};

/**
 * 5. 폐기 예정 재고 (유통기한 만료된 활성 재고) 목록을 조회합니다. (DisposalList.jsx 사용)
 * ⭐️ API 엔드포인트와 Mock 데이터 형식을 폐기 예정 리스트에 맞게 수정했습니다.
 * 백엔드 API: GET /stk/list/expired (만료일이 오늘보다 이른 활성 재고)
 */
export const fetchDisposalList = async () => {
    try {
        // ⭐️ 실제 API 호출 활성화: 만료된 재고 조회 엔드포인트 사용
        const response = await axios.get(`${BASE_URL}/list/expired`);
        return response.data; // StockRelocationRequiredResponse와 유사한 DTO 리스트를 반환한다고 가정
    } catch (error) {
        console.error("API 호출 실패: /list/expired (폐기 예정)", error);
        // Mock 데이터를 반환합니다. (폐기 예정 리스트에 필요한 정보: 제품명, 만료일, 수량)
        return ([ 
            { productName: '치즈케이크', expiryDate: '2025-10-15', quantity: 5 }, // 이미 지난 만료일
            { productName: '딸기잼 500g', expiryDate: '2025-09-20', quantity: 10 },
        ]);
    }
};

/**
 * 6. GTIN(바코드)을 이용해 해당 제품의 모든 활성 재고 랏(Lot)을 조회합니다. (DisposalView.jsx 사용)
 * 백엔드 API: GET /stk/list/gtin/{gtin} 또는 GET /stk/stock/gtin?gtin={gtin}
 * @param {string} gtin 스캔된 제품 바코드 (GTIN)
 */
export const fetchStockByGtin = async (gtin) => {
    try {
        // ⭐️ 실제 API 엔드포인트에 맞게 수정해주세요.
        const response = await axios.get(`${BASE_URL}/stock/gtin`, {
            params: { gtin }
        });
        return response.data; // Lot 정보 리스트를 반환
    } catch (error) {
        console.error(`API 호출 실패: /stock/gtin (GTIN: ${gtin})`, error);
        
        // Mock 데이터를 반환합니다. (DisposalView가 필요로 하는 형식)
        return ([ 
            // Mock 데이터 1 (유통기한/보관 위치가 다른 두 Lot)
            { lotId: 'LOT12345', productName: `스캔된 제품 (${gtin})`, location: 'A-01-01', expiryDate: '2026-05-20', quantity: 150, disposalQuantity: 0 },
            { lotId: 'LOT12346', productName: `스캔된 제품 (${gtin})`, location: 'B-02-05', expiryDate: '2025-12-10', quantity: 80, disposalQuantity: 0 },
        ]);
    }
};