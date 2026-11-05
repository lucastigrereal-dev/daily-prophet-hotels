import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Daily Prophet Hotels",
  description: "Sistema de marketing de conteudo para hoteis brasileiros",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFBFC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={"antialiased bg-[#FAFBFC] text-[#1A1D26]"}>
        {children}
        <Toaster
          position="top-center"
          richColors
          theme="light"
          toastOptions={{
            style: { background: "#FFFFFF", border: "1px solid #E5E7EB" },
          }}
        />
      </body>
    </html>
  );
}
