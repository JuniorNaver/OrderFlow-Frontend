// src/components/providers/LoadingProvider.jsx
import { createContext, useContext, useState } from "react";
import LoadingSpinner from "../loading/LoadingSpinner";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("로딩 중입니다...");

  const showLoading = (msg) => {
    setMessage(msg || "로딩 중입니다...");
    setIsLoading(true);
  };

  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {isLoading && <LoadingSpinner message={message} />}
    </LoadingContext.Provider>
  );
};

// Hook 형태로 어디서든 접근 가능
export const useLoading = () => useContext(LoadingContext);
