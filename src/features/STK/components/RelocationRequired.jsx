// features/STK/components/RelocationRequired.jsx

import React from 'react';
import InventoryListComponent from './InventoryListComponent';

// 가상 데이터
const DUMMY_RELOCATION_DATA = [
    { name: '냉장제품A', location: 'R-01-01', quantity: '50 EA' },
    { name: '실온제품B', location: 'T-05-12', quantity: '100 EA' },
];

const RelocationRequired = () => {
    return (
        <InventoryListComponent 
            title="위치 변경 필요 재고" 
            data={DUMMY_RELOCATION_DATA} 
            headers={['제품명', '현재 위치', '수량']}
        />
    );
};

// 💡 이전에 오류를 유발했던 주석 라인들을 모두 제거합니다.
export default RelocationRequired;