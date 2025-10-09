import { useState, useEffect } from "react";
import { searchProductsByName } from "../api/productApi";

function ProductSearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 입력할 때마다 API 호출 (디바운스 없이 단순 구현)
  useEffect(() => {
    const fetchData = async () => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }

      setLoading(true);
      const data = await searchProductsByName(query);
      setResults(data);
      setLoading(false);
    };

    fetchData();
  }, [query]);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[500px]">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">상품 검색</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 검색창 */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제품명을 입력하세요..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {/* 로딩 표시 */}
        {loading && <p className="text-center text-gray-500">검색 중...</p>}

        {/* 검색 결과 */}
        <div className="max-h-[300px] overflow-y-auto">
          {!loading && results.length > 0 ? (
            results.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                    if (window.addItemToSales) {
                        window.addItemToSales({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        qty: 1,
                        stock: product.stock,
                        });
                        alert(`✅ ${product.name}이(가) 판매 목록에 추가되었습니다.`);
                    } else {
                        alert("❌ 판매 테이블이 아직 준비되지 않았습니다.");
                    }
                    onSelect(product); // 선택 처리
                    }}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 transition"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{product.name}</span>
                  <span className="text-gray-600 text-sm">
                    ₩ {product.price.toLocaleString()}
                  </span>
                </div>
              </button>
            ))
          ) : (
            !loading && (
              <p className="text-gray-500 text-center py-10">검색 결과가 없습니다.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductSearchModal;