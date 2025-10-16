import { useEffect, useRef } from "react";

/**
 * 실전용 BarcodeListener
 * - Enter 또는 Tab 키로 한 세트 종료
 * - 입력간 간격이 100ms 이상이면 새 세트로 간주
 * - input focus 중엔 동작 안 함
 */
function BarcodeListener({ onBarcodeScan }) {
  const bufferRef = useRef("");
  const timerRef = useRef(null);

  useEffect(() => {
    const resetBuffer = () => {
      bufferRef.current = "";
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    const scheduleReset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        // 사람이 천천히 타이핑하면 자동 초기화
        resetBuffer();
      }, 100); // 100ms 넘으면 새 세트로 간주
    };

    const handleKeyDown = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (["input", "textarea"].includes(tag) || e.target?.isContentEditable)
        return; // 포커스된 입력창 무시

      if (e.key === "Enter" || e.key === "Tab") {
        const code = bufferRef.current.trim();
        if (code.length >= 6) {
          // 최소 길이 조건 (6자리 이상)
          onBarcodeScan(code);
        }
        resetBuffer();
        return;
      }

      // 일반 문자만 누적
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        scheduleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onBarcodeScan]);

  return null;
}

export default BarcodeListener;