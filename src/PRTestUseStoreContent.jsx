import { useContext } from "react";
import { StoreCtx } from "./PRTestStoreContext";

export const useStoreContext = () => {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("StoreProvider로 앱을 감싸주세요.");
  return ctx;
};