import React, { useState, useEffect } from 'react'; // 👈 useState, useEffect 추가
import { fetchDisposalList } from '../api/stockApi'; // 👈 API import

// ⭐️ Mock Data 제거: const DUMMY_DISPOSAL_DATA = ...

/**
 * 폐기 대상 목록을 표시하는 컴포넌트입니다.
 */
const DisposalList = () => {
    const [disposalData, setDisposalData] = useState([]); // 상태 추가
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchDisposalList(); // API 호출
                setDisposalData(data.map(item => ({...item, quantity: 0}))); // 수량 필드 추가
            } catch (error) {
                console.error("폐기 목록 데이터를 불러오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);
    
    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>폐기 목록 로딩 중...</div>;
    }

    if (disposalData.length === 0) {
         return <div style={{ textAlign: 'center', padding: '50px' }}>폐기 대상 제품이 없습니다.</div>;
    }

    return (
        <div>
            {/* 테이블 헤더 (생략) */}
            <div style={styles.header}>
                <span style={{ ...styles.col, flex: 0.5 }}>NO</span>
                <span style={{ ...styles.col, flex: 3 }}>제품명</span>
                <span style={{ ...styles.col, flex: 1.5 }}>단가</span>
                <span style={{ ...styles.col, flex: 2 }}>수량</span>
                <span style={{ ...styles.col, flex: 1 }}>재고</span>
            </div>

            {/* 목록 아이템 */}
            {disposalData.map((item, index) => ( // 👈 상태 데이터 사용
                <div key={item.no || index} style={styles.itemRow}>
                    {/* NO, 제품명, 단가 (생략) */}
                    <span style={{ ...styles.col, flex: 0.5 }}>{index + 1}</span>
                    <div style={{ ...styles.col, flex: 3, padding: '0 10px' }}>
                        <div style={styles.productName}>{item.name}</div>
                    </div>
                    <span style={{ ...styles.col, flex: 1.5, textAlign: 'right' }}>
                        {item.price ? item.price.toLocaleString() : 'N/A'}원
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
        border: '1px solid #ced4da'
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