import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BIDashboardApp from "../components/BIDashboardApp";

const queryClient = new QueryClient();

export default function BIPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <BIDashboardApp />
    </QueryClientProvider>
  );
}
