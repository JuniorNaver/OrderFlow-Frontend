import { useEffect, useState } from "react";

function BarcodeListener({ onBarcodeScan }) {
  const [barcode, setBarcode] = useState("");

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        // ✅ 바코드 한 세트 완성 시
        onBarcodeScan(barcode.trim());
        setBarcode("");
      } else {
        // ✅ 입력값 누적
        setBarcode((prev) => prev + e.key);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [barcode, onBarcodeScan]);

  return null; // 화면에 표시 안됨
}

export default BarcodeListener;