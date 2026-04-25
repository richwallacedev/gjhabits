import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GJ Habits",
  description:
    "Control diario de gastos y hábitos para Giss y Jorge con insights financieros.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GJ Habits"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  themeColor: "#0F172A"
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
