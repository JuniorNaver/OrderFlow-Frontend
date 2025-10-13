// features/STK/components/DisposalList.jsx

import React from 'react';

// 가상 데이터: 유통기한이 오늘인 제품 (폐기 대상)
const DUMMY_DISPOSAL_DATA = [
    { no: 1, name: '햇반(100g) 01584123', price: 3000, quantity: 0, stock: 5 },
    { no: 2, name: '컵라면A 01584123', price: 1300, quantity: 0, stock: 10 },
    { no: 3, name: '생수(2L) 01584123', price: 5200, quantity: 0, stock: 20 },
    { no: 4, name: '캔커피 01584123', price: 200, quantity: 0, stock: 8 },
];

/**
 * 폐기 대상 목록을 표시하는 컴포넌트입니다.
 * 스토리보드 (image_98669f.png)의 NO.1 영역을 담당합니다.
 */
const DisposalList = () => {
    return (
        <div>
            {/* 테이블 헤더 */}
            <div style={styles.header}>
                <span style={{ ...styles.col, flex: 0.5 }}>NO</span>
                <span style={{ ...styles.col, flex: 3 }}>제품명</span>
                <span style={{ ...styles.col, flex: 1.5 }}>단가</span>
                <span style={{ ...styles.col, flex: 2 }}>수량</span>
                <span style={{ ...styles.col, flex: 1 }}>재고</span>
            </div>

            {/* 목록 아이템 */}
            {DUMMY_DISPOSAL_DATA.map(item => (
                <div key={item.no} style={styles.itemRow}>
                    {/* NO */}
                    <span style={{ ...styles.col, flex: 0.5 }}>{item.no}</span>
                    
                    {/* 제품명 */}
                    <div style={{ ...styles.col, flex: 3, padding: '0 10px' }}>
                        <div style={styles.productName}>{item.name}</div>
                    </div>
                    
                    {/* 단가 */}
                    <span style={{ ...styles.col, flex: 1.5, textAlign: 'right' }}>
                        {item.price.toLocaleString()}원
                    </span>
                    
                    {/* 수량 입력 */}
                    <div style={{ ...styles.col, flex: 2, display: 'flex', alignItems: 'center' }}>
                        <input type="number" 
                               defaultValue={item.quantity} 
                               min="0"
                               max={item.stock}
                               style={styles.quantityInput} 
                        />
                    </div>
                    
                    {/* 재고 */}
                    <span style={{ ...styles.col, flex: 1, textAlign: 'center' }}>{item.stock}</span>
                </div>
            ))}
        </div>
    );
};

const styles = {
    header: { 
        display: 'flex', 
        fontWeight: 'bold', 
        padding: '10px 0', 
        borderBottom: '3px solid #343a40', 
        fontSize: '0.9rem',
        backgroundColor: '#f8f9fa'
    },
    itemRow: { 
        display: 'flex', 
        alignItems: 'center',
        padding: '15px 0', 
        borderBottom: '1px solid #eee', 
        fontSize: '0.95rem',
        borderRadius: '5px',
        marginBottom: '10px',
        border: '1px solid #ced4da' // 스토리보드의 박스 형태 구현
    },
    col: { 
        padding: '0 5px',
        minHeight: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    productName: {
        fontWeight: '500',
        color: '#343a40'
    },
    quantityInput: {
        width: '50px',
        textAlign: 'center',
        marginRight: '5px',
        padding: '3px',
        border: '1px solid #ced4da',
        borderRadius: '3px'
    }
};

export default DisposalList;