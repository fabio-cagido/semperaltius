import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avaliação Institucional 360º (2026) | Colégios Everest",
  description: "Dashboard Executivo da Avaliação Institucional 360º da Rede de Colégios Semper Altius - Unidades Curitiba e Rio de Janeiro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
