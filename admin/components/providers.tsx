"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n";
import { InstallPromptProvider } from "@/lib/install-prompt";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <LanguageProvider>
        <InstallPromptProvider>{children}</InstallPromptProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
