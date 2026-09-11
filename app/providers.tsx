/**
 * providers.tsx — Providers (NextAuth SessionProvider)
 */
"use client";

import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";

const IrisWidget = dynamic(() => import("@/components/iris/IrisWidget").then(mod => mod.IrisWidget), {
  ssr: false, // Widget doesn't need to be server-rendered
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <IrisWidget />
    </SessionProvider>
  );
}
