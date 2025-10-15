const BASE_URL = 'http://localhost:8080/api/stk'; 

export const fetchCapacityStatus = async () => 
    // ... (실제 API 호출)
    ({ total: 1000, current: 780, unit: 'CBM' }); // 임시 Mock 반환

// ⭐️ days 파라미터를 제거하여 경고를 없앱니다.
export const fetchExpiryStatus = async () => 
    // const response = await axios.get(`${BASE_URL}/status/expiry?days=90`); 
    // return response.data;
    ({ total: 5000, current: 1275, unit: '개' }); // 임시 Mock 반환

export const fetchDisposalList = async () =>
    // const response = await axios.get(`${BASE_URL}/list/disposal`);
    // return response.data;
    ([ // 임시 Mock 반환 (DUMMY_DISPOSAL_DATA)
        { no: 1, name: '햇반(100g) 01584123', price: 3000, stock: 5 },
        { no: 2, name: '컵라면A 01584123', price: 1300, stock: 10 },
    ]);

export const fetchRelocationList = async () =>
    // const response = await axios.get(`${BASE_URL}/list/relocation`);
    // return response.data;
    ([ // 임시 Mock 반환 (DUMMY_RELOCATION_DATA)
        { name: '냉장제품A', location: 'R-01-01', quantity: '50 EA' },
        { name: '실온제품B', location: 'T-05-12', quantity: '100 EA' },
    ]);
    
export const fetchStockStatusList = async () =>
    // const response = await axios.get(`${BASE_URL}/list/all`);
    // return response.data;
    ([ // 임시 Mock 반환 (DUMMY_STOCK_DATA)
        { name: '실온제품C', location: 'T-01-01', quantity: '2,500 EA' },
        { name: '냉동제품D', location: 'F-10-05', quantity: '1,200 EA' },
    ]);

// ... (다른 API 함수들)