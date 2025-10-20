import React from 'react';
// PropTypes는 상위 컴포넌트에서 정의하므로 여기서는 생략합니다.

const styles = {
    title: { fontSize: '1.25rem', fontWeight: '600', paddingBottom: '8px', marginBottom: '10px', borderBottom: '1px solid #f0f0f0' },
    header: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', padding: '10px 0', borderBottom: '2px solid #333' },
    item: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dotted #eee', fontSize: '0.95rem' },
    col: { flex: 1, textAlign: 'left', minWidth: '80px' }
};

/**
 * 범용적인 목록 표시 컴포넌트입니다.
 * data는 DTO 객체의 배열 형태이며, dataMapper 함수를 통해 각 헤더에 맞는 값을 추출합니다.
 * * @param {string} title - 목록 제목
 * @param {Array<string>} headers - 테이블 헤더 배열
 * @param {Array<Object>} data - DTO 객체의 배열
 * @param {function(Object, string): any} dataMapper - 데이터를 매핑하는 함수 (item, header) => value
 */
const InventoryListComponent = ({ title, data, headers, dataMapper }) => {
    return (
        <div>
            <h3 style={styles.title}>{title}</h3>
            
            <div style={styles.header}>
                {headers.map((h, i) => (
                    <span 
                        key={i} 
                        style={{ 
                            ...styles.col, 
                            // '수량'이 포함된 헤더는 오른쪽 정렬
                            ...(h.includes('수량') ? { textAlign: 'right', flex: 0.5 } : {}) 
                        }}
                    >
                        {h}
                    </span>
                ))}
            </div>

            {data.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>조회된 데이터가 없습니다.</div>
            ) : (
                // ⭐️ DTO 객체(item)를 순회
                data.map((item, index) => (
                    <div key={index} style={styles.item}>
                        {headers.map((header, i) => (
                            <span 
                                key={i} 
                                style={{ 
                                    ...styles.col, 
                                    // '수량'이 포함된 헤더는 오른쪽 정렬
                                    ...(header.includes('수량') ? { textAlign: 'right', flex: 0.5 } : {}) 
                                }}
                            >
                                {/* ⭐️ dataMapper 함수를 사용하여 값을 추출 */}
                                {dataMapper(item, header)} 
                            </span>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
};

export default InventoryListComponent;