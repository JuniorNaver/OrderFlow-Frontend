import { useState, useEffect } from "react";
import { searchProductsByName } from "../../api/productApi";

function ProductSearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchProductsByName(query);
        setResults(data || []);
      } catch (err) {
        console.error("❌ 상품 검색 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  const handleSelect = (product) => {
    if (onSelect) onSelect(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[2000]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[500px] z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">상품 검색</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제품명을 입력하세요..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {loading && <p className="text-center text-gray-500">검색 중...</p>}

        <div className="max-h-[300px] overflow-y-auto">
          {!loading && results.length > 0 ? (
            results.map((product, index) => (
              <button
                key={`${product.gtin || product.id || "p"}-${index}`}
                onClick={() => handleSelect(product)}
                className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    {product.name || product.productName}
                  </span>
                  <span className="text-gray-600 text-sm">
                    ₩ {(product.unitPrice ?? product.salePrice ?? product.price ?? 0).toLocaleString()}
                  </span>
                </div>
              </button>
            ))
          ) : (
            !loading && (
              <p className="text-gray-500 text-center py-10">
                검색 결과가 없습니다.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductSearchModal;
