import React, { useState } from 'react';

// ----------------------------------------------------
// 공통 스타일
const styles = {
  container: { padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' },
  form: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '20px', 
    padding: '20px', 
    border: '1px solid #ddd', 
    borderRadius: '6px', 
    backgroundColor: '#fff',
    maxWidth: '800px',
    margin: '0 auto'
  },
  group: { gridColumn: 'span 2', marginBottom: '10px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#374151' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' },
  select: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' },
  textarea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box', minHeight: '80px' },
  button: { 
    padding: '10px 20px', 
    backgroundColor: '#3b82f6', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    transition: 'background-color 0.2s',
    marginTop: '20px',
    fontSize: '1rem',
    gridColumn: 'span 2'
  },
  alert: { padding: '15px', borderRadius: '4px', marginTop: '20px', fontWeight: 'bold' }
};

// ----------------------------------------------------
// 메인 StockAdjustmentView 컴포넌트
const StockAdjustmentView = () => {
  const [formData, setFormData] = useState({
    productName: '',
    location: '',
    currentStock: 0,
    adjustedStock: 0,
    reason: '',
    note: ''
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const diff = formData.adjustedStock - formData.currentStock;
    if (!formData.reason || !formData.productName) {
        setMessage({ type: 'error', text: '제품명과 조정 사유는 필수 입력 항목입니다.' });
        return;
    }
    
    console.log('재고 조정 데이터 제출:', formData);
    setMessage({ 
        type: 'success', 
        text: `${formData.productName} 재고가 ${diff > 0 ? '+' : ''}${diff}개 조정 완료되었습니다.` 
    });
    // 폼 초기화 로직 (실제 API 호출 후 처리)
    setFormData({
        productName: '',
        location: '',
        currentStock: 0,
        adjustedStock: 0,
        reason: '',
        note: ''
    });
  };

  return (
    <div style={styles.container}>
      {message && (
        <div 
            style={{ 
                ...styles.alert, 
                backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: message.type === 'success' ? '#065f46' : '#991b1b',
                maxWidth: '800px',
                margin: '0 auto 20px auto'
            }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={{ gridColumn: 'span 2' }}>
            <h3 style={{ margin: '0 0 15px 0', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>재고 조정 정보 입력</h3>
        </div>

        <div>
          <label style={styles.label}>제품명 / 품번</label>
          <input 
            type="text" 
            name="productName" 
            value={formData.productName} 
            onChange={handleChange} 
            style={styles.input} 
            placeholder="제품명 또는 품번 검색"
            required
          />
        </div>

        <div>
          <label style={styles.label}>위치 (창고명/구역)</label>
          <input 
            type="text" 
            name="location" 
            value={formData.location} 
            onChange={handleChange} 
            style={styles.input} 
            placeholder="예: A창고 B구역"
          />
        </div>

        <div>
          <label style={styles.label}>현재 시스템 재고</label>
          <input 
            type="number" 
            name="currentStock" 
            value={formData.currentStock} 
            onChange={handleChange} 
            style={styles.input} 
            readOnly
          />
        </div>

        <div>
          <label style={styles.label}>조정할 실제 재고</label>
          <input 
            type="number" 
            name="adjustedStock" 
            value={formData.adjustedStock} 
            onChange={handleChange} 
            style={styles.input} 
            required
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>조정 사유</label>
          <select 
            name="reason" 
            value={formData.reason} 
            onChange={handleChange} 
            style={styles.select} 
            required
          >
            <option value="">-- 조정 사유 선택 --</option>
            <option value="실사 오류">실사 오류</option>
            <option value="재고 손실">재고 손실 (파손/분실)</option>
            <option value="시스템 오류">시스템 오류</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>상세 메모 (선택 사항)</label>
          <textarea 
            name="note" 
            value={formData.note} 
            onChange={handleChange} 
            style={styles.textarea} 
            placeholder="재고 조정에 대한 상세 내용을 기록해주세요."
          />
        </div>

        <button type="submit" style={styles.button}>
          재고 수량 조정 확정
        </button>
      </form>
    </div>
  );
};

export default StockAdjustmentView;
