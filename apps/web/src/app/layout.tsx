import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { getPublicEnv } from "../lib/env/env";
import { QueryProvider } from "../providers/query-provider";
import "../styles/globals.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

const { siteName, siteTagline } = getPublicEnv();

export const metadata: Metadata = {
  title: {
    default: `${siteName} — ${siteTagline}`,
    template: `%s | ${siteName}`,
  },
  description: siteTagline,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans">
        <QueryProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
