/**
 * providers.tsx — Providers (NextAuth SessionProvider)
 */
"use client";

import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import { IrisProvider, IrisLayoutWrapper } from "@/src/context/IrisContext";

const IrisWidget = dynamic(() => import("@/components/iris/IrisWidget").then(mod => mod.IrisWidget), {
  ssr: false, // Widget doesn't need to be server-rendered
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <IrisProvider>
        <IrisLayoutWrapper>
          {children}
        </IrisLayoutWrapper>
        <IrisWidget />
      </IrisProvider>
    </SessionProvider>
  );
}
