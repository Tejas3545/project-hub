'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Explore', href: '/projects' },
    { name: 'Paths', href: '/learning-paths' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  useEffect(() => {
    const closeMobileMenu = () => setIsMobileMenuOpen(false);
    closeMobileMenu();
  }, [pathname]);

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group relative z-50">
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-white text-lg">hub</span>
          </div>
          <span className="text-[#020817] text-lg font-bold tracking-tight">
            Project<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-accent'
                    : 'text-[#64748b] hover:text-[#020817] hover:bg-[#f9fafb]'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 relative z-50">
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-[#64748b] hover:text-[#020817] px-4 py-2 transition-colors duration-200 rounded-lg hover:bg-[#f9fafb]"
                >
                  Dashboard
                </Link>
                {user.role === 'ADMIN' && (
                  <>
                    <Link
                      href="/admin/projects"
                      className="text-sm font-medium text-primary hover:text-primary-dark px-4 py-2 transition-colors duration-200 rounded-lg hover:bg-accent"
                    >
                      Projects
                    </Link>
                    <Link
                      href="/admin/github-projects"
                      className="text-sm font-medium text-[#64748b] hover:text-[#020817] px-4 py-2 transition-colors duration-200 rounded-lg hover:bg-[#f9fafb]"
                    >
                      QA Queue
                    </Link>
                  </>
                )}
                <button
                  onClick={logout}
                  className="btn-primary text-sm px-5 py-2"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#64748b] hover:text-[#020817] hover:bg-accent px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/projects"
                  className="btn-primary text-sm px-5 py-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden size-10 flex items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] hover:bg-[#f9fafb] transition-colors"
          >
            <span className="material-symbols-outlined">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-[#e2e8f0] p-6 flex flex-col gap-4 lg:hidden shadow-lg"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-primary bg-accent'
                      : 'text-[#64748b] hover:text-[#020817] hover:bg-[#f9fafb]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="h-px bg-[#e2e8f0]" />
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/dashboard" className="w-full text-center py-3 text-sm font-medium text-[#020817] bg-[#f9fafb] rounded-xl border border-[#e2e8f0]">
                    Dashboard
                  </Link>
                  <button onClick={logout} className="w-full text-center py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/20">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full text-center py-3 text-sm font-medium text-[#020817] bg-[#f9fafb] rounded-xl border border-[#e2e8f0]">
                    Sign In
                  </Link>
                  <Link href="/projects" className="w-full text-center py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/20">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
