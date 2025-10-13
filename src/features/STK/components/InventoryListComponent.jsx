// features/STK/components/InventoryListComponent.jsx
import React from 'react';

const styles = {
    title: { fontSize: '1.25rem', fontWeight: '600', paddingBottom: '8px', marginBottom: '10px', borderBottom: '1px solid #f0f0f0' },
    header: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', padding: '10px 0', borderBottom: '2px solid #333' },
    item: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dotted #eee', fontSize: '0.95rem' },
    col: { flex: 1, textAlign: 'left' }
};

const InventoryListComponent = ({ title, data, headers }) => {
    return (
        <div>
            <h3 style={styles.title}>{title}</h3>
            
            <div style={styles.header}>
                {headers.map((h, i) => <span key={i} style={styles.col}>{h}</span>)}
            </div>

            {data.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>조회된 데이터가 없습니다.</div>
            ) : (
                data.map((item, index) => (
                    <div key={index} style={styles.item}>
                        <span style={styles.col}>{item.name}</span>
                        <span style={styles.col}>{item.location}</span>
                        <span style={{ ...styles.col, textAlign: 'right' }}>{item.quantity}</span>
                    </div>
                ))
            )}
        </div>
    );
};

export default InventoryListComponent;