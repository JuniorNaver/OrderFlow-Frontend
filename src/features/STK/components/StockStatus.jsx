// features/STK/components/StockStatus.jsx
import React from 'react';
import InventoryListComponent from './InventoryListComponent';

// 가상 데이터
const DUMMY_STOCK_DATA = [
    { name: '실온제품C', location: 'T-01-01', quantity: '2,500 EA' },
    { name: '냉동제품D', location: 'F-10-05', quantity: '1,200 EA' },
    { name: '냉장제품E', location: 'R-03-02', quantity: '550 EA' },
    { name: '실온제품F', location: 'T-04-10', quantity: '3,100 EA' },
    { name: '냉동제품G', location: 'F-01-01', quantity: '800 EA' },
];

const StockStatus = () => {
    return (
        <InventoryListComponent 
            title="전체 재고 현황 (품목별)" 
            data={DUMMY_STOCK_DATA} 
            headers={['제품명', '보관 위치', '현재 수량']}
        />
    );
};

export default StockStatus;