import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Monitoring Driver | Dispatcher Operations",
  description: "Sistem Manajemen & Monitoring Operasional Driver Dispatcher: Ketersediaan Armada, Aktivitas Order, dan Kinerja Driver.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
