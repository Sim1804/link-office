import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LinkOffice — Évaluez et développez votre qualité relationnelle",
  description:
    "Évaluez votre Indice de Qualité Relationnelle et Humaine (IQRH) et bénéficiez des conseils personnalisés de l'IA IRIS.",
  keywords: ["IQRH", "qualité relationnelle", "bien-être", "IRIS", "coaching"],
  icons: {
    icon: "/logo_link_graphique.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#F8F9FA] text-[#123D46]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
