import axios from 'axios';

// ⭐️ 수정: BASE URL에서 '/api/stk'를 제거합니다. 
// 각 함수에서 '/api/stk'를 명시적으로 추가하여 URL 중복을 방지합니다.
const BASE_URL = 'http://localhost:8080'; 

// =================================================================
// ⭐️ Helper 함수: fetchAdjustmentList를 위해 필요
// =================================================================
const getFormattedDate = (daysOffset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
};

/**
 * 1. 전체 재고 현황 목록을 조회합니다.
 */
export const fetchStockStatusList = async () => {
    try {
        // ⭐️ 수정: /api/stk 경로 명시적 추가
        const response = await axios.get(`${BASE_URL}/api/stk/list/all`);
        return response.data;
    } catch (error) {
        console.error("API 호출 실패: /api/stk/list/all", error);
        // Mock 데이터 반환
        return ([ 
            { name: '콜라 500ml (Mock)', warehouseId: 'W001', quantity: 100 },
            { name: '사이다 500ml (Mock)', warehouseId: 'W002', quantity: 250 },
        ]);
    }
};


/**
 * 2. 위치 변경 필요 재고 목록을 조회합니다.
 */
export const fetchRelocationList = async (warehouseId) => { 
    try {
        // ⭐️ 수정: /api/stk 경로 명시적 추가
        const response = await axios.get(`${BASE_URL}/api/stk/list/relocation-required`, { 
            params: { warehouseId } 
        }); 
        return response.data;
    } catch (error) {
        console.error("API 호출 실패: /api/stk/list/relocation-required", error);
        // Mock 데이터 반환
        return ([ 
            // lotId, stkId는 백엔드 Long 타입에 맞게 숫자로 설정
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
        // ⭐️ 수정: /api/stk 경로 명시적 추가
        const response = await axios.get(`${BASE_URL}/api/stk/status/capacity`);
        return response.data; 
    } catch (error) {
        console.error("API 호출 실패: /api/stk/status/capacity", error);
        return ({ total: 1000, current: 780, unit: 'CBM' }); 
    }
};


/**
 * 4. 만료 임박 재고 현황 데이터를 조회합니다.
 */
export const fetchExpiryStatus = async (days = 90) => {
    try {
        // ⭐️ 수정: /api/stk 경로 명시적 추가
        const response = await axios.get(`${BASE_URL}/api/stk/status/expiry`, {
            params: { days }
        });
        return response.data; // ProgressStatusDTO 반환
    } catch (error) {
        console.error(`API 호출 실패: /api/stk/status/expiry (기준일: ${days}일)`, error);
        // Mock 데이터를 반환합니다.
        return ({ total: 5000, current: 1275, unit: '개' }); 
    }
};

/**
 * 5. 폐기 예정 재고 (유통기한 만료된 활성 재고) 목록을 조회합니다.
 */
export const fetchDisposalList = async () => {
    try {
        // ⭐️ 수정: /api/stk 경로 명시적 추가
        const response = await axios.get(`${BASE_URL}/api/stk/list/expired`);
        return response.data; 
    } catch (error) {
        console.error("API 호출 실패: /api/stk/list/expired (폐기 예정)", error);
        // Mock 데이터를 반환합니다.
        return ([ 
            // lotId는 백엔드 Long 타입에 맞게 숫자로 설정
            { lotId: 701, productName: '치즈케이크', expiryDate: '2025-10-15', quantity: 5 }, 
            { lotId: 702, productName: '딸기잼 500g', expiryDate: '2025-09-20', quantity: 10 },
        ]);
    }
};

/**
 * 6. GTIN(바코드)을 이용해 해당 제품의 모든 활성 재고 랏(Lot)을 조회합니다.
 */
export const fetchStockByGtin = async (gtin) => {
    try {
        // ⭐️ 수정: /api/stk 경로 명시적 추가
        const response = await axios.get(`${BASE_URL}/api/stk/list/gtin`, {
            params: { gtin }
        });
        return response.data; // Lot 정보 리스트를 반환
    } catch (error) {
        console.error(`API 호출 실패: /api/stk/list/gtin (GTIN: ${gtin})`, error); 
        
        // Mock 데이터: lotId를 Long 타입에 맞게 숫자로 변경했습니다.
        return ([ 
            { lotId: 12345, productName: `스캔된 제품 (${gtin})`, location: 'A-01-01', expiryDate: '2026-05-20', quantity: 150, disposalQuantity: 0 },
            { lotId: 12346, productName: `스캔된 제품 (${gtin})`, location: 'B-02-05', expiryDate: '2025-12-10', quantity: 80, disposalQuantity: 0 },
        ]);
    }
};

/**
 * 7. 최종 폐기 요청을 서버에 전송하고 재고를 처리합니다.
 * 백엔드 API: POST /api/stk/disposal
 * @param {DisposalRequest} requestDTO 폐기 요청 목록 (lotId, quantity 포함)
 */
export const executeDisposal = async (requestDTO) => {
    try {
        // ⭐️ 수정: /disposal/execute 대신 /disposal 로 요청합니다.
        const response = await axios.post(`${BASE_URL}/api/stk/disposal`, requestDTO);
        return response.data; // 처리된 STK 목록 반환
    } catch (error) {
        console.error("API 호출 실패: /api/stk/disposal", error);
        throw error; 
    }
};

/**
 * 8. 재고 조정 대상 목록을 조회합니다.
 */
export const fetchAdjustmentList = async () => {
    // API 호출 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 800)); 

    // 백엔드 API 호출이 누락되어 Mock 데이터로 대체합니다.
    // try {
    //     const response = await axios.get(`${BASE_URL}/api/stk/list/adjustment`);
    //     return response.data;
    // } catch (error) {
    //     console.error("API 호출 실패: /api/stk/list/adjustment", error);
    //     // Mock 데이터를 반환
    // }

    return [
        // lotId는 백엔드 Long 타입에 맞게 숫자로 설정
        { 
            lotId: 501, 
            productName: 'A사 유기농 우유', 
            location: 'W01-A01', 
            expiryDate: getFormattedDate(5), 
            quantity: -5 // ❌ 마이너스 재고 (조정 대상)
        },
        { 
            lotId: 502, 
            productName: 'B사 냉동 치킨', 
            location: 'F02-B03', 
            expiryDate: getFormattedDate(30), 
            quantity: 0 // ❌ 0 재고 (조정 대상)
        },
        { 
            lotId: 503, 
            productName: 'C사 생수 500ml', 
            location: 'W03-C01', 
            expiryDate: getFormattedDate(180), 
            quantity: -20 // ❌ 마이너스 재고 (조정 대상)
        },
        { 
            lotId: 504, 
            productName: 'D사 초콜릿 (FIFO 위반 의심)', 
            location: 'W01-A02', 
            expiryDate: getFormattedDate(15), 
            quantity: -1 // ❌ 마이너스 재고 (조정 대상)
        },
    ];
};

/**
 * 9. 재고 조정을 실행합니다.
 * 백엔드 API: POST /api/stk/adjustment/execute
 * @param {object} requestDto - { items: [{ lotId, targetQuantity }] }
 * @returns {Promise<Array>} 업데이트된 랏 목록 ({ lotId, quantity } 포함)
 */
export const executeStockAdjustment = async (requestDto) => {
    // 실제 API 호출 로직은 다음과 같을 것입니다.
    // try {
    //     const response = await axios.post(`${BASE_URL}/api/stk/adjustment/execute`, requestDto);
    //     return response.data; 
    // } catch (error) {
    //     console.error("API 호출 실패: /api/stk/adjustment/execute", error);
    //     throw error;
    // }

    // Mock API 호출 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const updatedStocks = requestDto.items.map(item => {
        // Mock 로직: targetQuantity가 새로운 quantity가 됩니다.
        return { 
            lotId: item.lotId, 
            quantity: item.targetQuantity 
        };
    });

    // 백엔드에서 200 OK와 함께 업데이트된 랏 목록을 반환했다고 가정합니다.
    return updatedStocks;
};