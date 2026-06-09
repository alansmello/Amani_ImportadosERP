import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amani ERP",
  description: "Frontend oficial do Amani ERP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body>{children}</body>
    </html>
  );
}
