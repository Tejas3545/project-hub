import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import Header from "@/components/Header";
import { Footer } from "@/components/ui/footer";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'optional',
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-mono',
  display: 'optional',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: "Project Hub — Build Real Things",
  description: "Stop watching tutorials. Start building.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans min-h-screen bg-background text-foreground`}>
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
