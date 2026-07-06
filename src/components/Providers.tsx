"use client";

import { ComparisonProvider } from "@/context/ComparisonContext";
import ComparisonModal from "@/components/ComparisonModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ComparisonProvider>
      {children}
      <ComparisonModal />
    </ComparisonProvider>
  );
}
