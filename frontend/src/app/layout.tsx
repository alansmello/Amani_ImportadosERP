import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { RootShell } from "@/components/layout/root-shell";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

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
    <html lang="pt-BR" className={`${inter.variable} dark`}>
      <body>
        <AppProviders>
          <RootShell>{children}</RootShell>
        </AppProviders>
      </body>
    </html>
  );
}
