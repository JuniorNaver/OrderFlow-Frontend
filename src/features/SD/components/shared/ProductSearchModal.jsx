import { useState, useEffect } from "react";
import { searchProductsByName } from "../../api/productApi";
import { addItemToOrder } from "../../api/sdApi"; // ✅ 추가

function ProductSearchModal({ onClose, onSelect, orderId }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false); // ✅ 중복 클릭 방지용

  // ✅ 상품 검색
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

  // ✅ 상품 추가 (서버 연결)
  const handleAddProduct = async (product) => {
  if (!orderId) {
    alert("⛔ 주문이 아직 생성되지 않았습니다. 잠시 후 다시 시도하세요.");
    return;
  }

  if (adding) return;
  setAdding(true);

  try {
    console.log("🧾 주문 ID:", orderId);
    console.log("🧾 추가 요청 상품:", product);

    const itemData = {
      orderId,
      gtin: product.gtin,
      quantity: 1,
      price: product.price,
    };

    const added = await addItemToOrder(orderId, itemData);
    console.log("✅ 추가된 상품:", added);

    // ✅ 여기서 프론트에서 사용하는 필드명 통일
    const normalized = {
      ...added,
      name: product.productName || product.name, // ✅ 핵심
      price: product.price,
      gtin: product.gtin,
      stock: product.quantity,
    };

    alert(`🛒 ${normalized.name}이(가) 주문에 추가되었습니다.`);
    if (onSelect) onSelect(normalized);
    onClose();
  } catch (err) {
    console.error("❌ 상품 추가 실패:", err);
    alert("상품을 추가하는 중 오류가 발생했습니다.\n(주문 생성 후 다시 시도해주세요)");
  } finally {
    setAdding(false);
  }
};

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[2000]">
      {/* 🔲 어두운 반투명 + 블러 배경 (카드 결제와 동일) */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

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
            results.map((product, index) => (
              <button
                key={`${product.gtin || product.id || "p"}-${index}`}
                onClick={() => handleAddProduct(product)}
                disabled={!orderId || adding} // ✅ 주문 없거나 클릭 중이면 비활성화
                className={`w-full text-left px-4 py-3 border-b border-gray-100 transition
                  ${
                    !orderId || adding
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-50"
                  }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    {product.name}
                  </span>
                  <span className="text-gray-600 text-sm">
                    ₩ {product.price?.toLocaleString() ?? 0}
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
    </div>
  );
}

export default ProductSearchModal;
