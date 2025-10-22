// src/common/providers/RootProvider.jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./authorities/component/AuthProvider";
import { ToastProvider } from "../components/providers/ToastProvider";
import { LoadingProvider } from "../components/providers/LoadingProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,          // 기본 재시도 비활성화 (API 안정성 위해)
      refetchOnWindowFocus: false,
    },
  },
});


export default function RootProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
