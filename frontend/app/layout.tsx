import type { Metadata } from "next";
import { Manrope, Cormorant_Garamond } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GlobalBackground from "@/components/ui/global-background";
import { FloatingNav } from "@/components/ui/floating-navbar";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: '--font-manrope',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ['400', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Project Hub - Build Real Skills Through Real Projects",
  description: "Industry-grade project platform for skill development. Stop watching tutorials, start building.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#030303',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${cormorant.variable} antialiased bg-bg-primary text-text-primary`}>
        <ErrorBoundary>
          <AuthProvider>
            <GlobalBackground>
              <FloatingNav navItems={[
                { name: "Home", link: "/" },
                { name: "Projects", link: "/projects" },
              ]} />
              <main className="min-h-screen relative z-10 font-sans pt-16 sm:pt-20">
                {children}
              </main>
              <footer className="py-8 sm:py-12 mt-12 sm:mt-20 relative z-10 bg-black/20 backdrop-blur-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
                    <div className="text-text-muted text-xs sm:text-sm text-center md:text-left">
                      © 2026. All rights reserved.
                    </div>
                    <div className="text-text-muted text-xs sm:text-sm font-display font-semibold text-center md:text-right">
                      Building the future, one project at a time.
                    </div>
                  </div>
                </div>
              </footer>
            </GlobalBackground>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
