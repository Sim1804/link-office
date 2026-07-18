import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LinkOffice — Évaluez et développez votre qualité relationnelle",
  description:
    "Évaluez votre Indice de Qualité Relationnelle et Humaine (IQRH) et bénéficiez des conseils personnalisés de l'IA IRIS.",
  keywords: ["IQRH", "qualité relationnelle", "bien-être", "IRIS", "coaching"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
