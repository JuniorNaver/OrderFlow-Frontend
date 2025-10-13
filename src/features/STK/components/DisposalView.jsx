// features/STK/components/DisposalView.jsx

import React from 'react';
import DisposalList from './DisposalList'; // 폐기 대상 목록 컴포넌트

/**
 * [새로 추가] 폐기 페이지 뷰 컴포넌트입니다.
 * 스토리보드 (image_98669f.png)에 기반하여 유통기한 당일 제품 목록을 보여줍니다.
 */
const DisposalView = () => {
    return (
        <div style={styles.container}>
            <h2 style={styles.title}>
                🗑️ 폐기 페이지
            </h2>
            
            <div style={styles.contentGrid}>
                {/* 👈 좌측: 유통기한 당일 제품 리스트 */}
                <div style={styles.listArea}>
                    <DisposalList />
                </div>
                
                {/* 👉 우측: 폐기 처리 버튼 및 요약 정보 영역 */}
                <div style={styles.summaryArea}>
                    <div style={styles.disposalBox}>
                        <h3 style={styles.disposalTitle}>2. 폐기 처리</h3>
                        <p style={{marginTop: '20px', color: '#6c757d'}}>선택된 제품의 폐기 처리를 진행합니다.</p>
                        <button style={styles.disposalButton}>폐기 완료</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { 
        padding: '20px', 
        backgroundColor: '#ffffff', 
        minHeight: '80vh', 
        borderRadius: '8px' 
    },
    title: { 
        fontSize: '1.8rem', 
        fontWeight: '700', 
        color: '#dc3545', 
        borderBottom: '2px solid #dc3545', 
        paddingBottom: '10px', 
        marginBottom: '30px' 
    },
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: '3fr 1fr', // 리스트가 넓고, 버튼 영역이 좁음
        gap: '20px'
    },
    listArea: {
        // 리스트 스타일
    },
    summaryArea: {
        // 폐기 박스 스타일
    },
    disposalBox: {
        border: '1px solid #ced4da',
        borderRadius: '4px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        height: '200px'
    },
    disposalTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#343a40'
    },
    disposalButton: {
        marginTop: '30px',
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default DisposalView;