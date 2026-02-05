'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { user, logout, isAdmin } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setMobileMenuOpen(false);
        router.push('/');
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 border-b border-border-subtle backdrop-blur-lg bg-bg-primary/80">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center h-16 relative">
                    {/* Logo */}
                    <Link href="/" className="absolute left-0 flex items-center gap-2 group" onClick={closeMobileMenu}>
                        <div className="text-xl font-bold text-text-primary tracking-tight">
                            ProjectHub
                        </div>
                    </Link>

                    {/* Desktop Navigation - Centered */}
                    <nav className="hidden md:inline-flex items-center gap-2 bg-surface-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border-subtle">
                        <Link
                            href="/"
                            className="px-4 py-1.5 text-sm text-text-secondary hover:text-white transition-all font-medium whitespace-nowrap rounded-full hover:bg-white/5"
                        >
                            Home
                        </Link>

                        <Link
                            href="/projects"
                            className="px-4 py-1.5 text-sm text-text-secondary hover:text-white transition-all font-medium whitespace-nowrap rounded-full hover:bg-white/5"
                        >
                            Projects
                        </Link>

                        {user && (
                            <Link
                                href="/profile"
                                className="px-4 py-1.5 text-sm text-text-secondary hover:text-white transition-all font-medium whitespace-nowrap rounded-full hover:bg-white/5"
                            >
                                Profile
                            </Link>
                        )}

                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="px-4 py-1.5 text-sm text-accent-warm hover:text-white transition-all font-medium whitespace-nowrap rounded-full hover:bg-accent-warm/10"
                            >
                                Admin
                            </Link>
                        )}

                        {user && (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-1.5 text-sm font-medium text-text-secondary hover:text-white transition-all whitespace-nowrap rounded-full hover:bg-white/5"
                            >
                                Logout
                            </button>
                        )}
                    </nav>

                    {/* Right side actions - Only show when logged out */}
                    {!user && (
                        <div className="absolute right-0 hidden md:flex items-center gap-2">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary-light text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border-subtle animate-in fade-in slide-in-from-top-2 duration-200">
                        <nav className="flex flex-col space-y-4">
                            <Link
                                href="/"
                                className="text-text-secondary hover:text-primary-light transition-colors font-medium px-2 py-2"
                                onClick={closeMobileMenu}
                            >
                                Domains
                            </Link>

                            {user && (
                                <Link
                                    href="/dashboard"
                                    className="text-text-secondary hover:text-primary-light transition-colors font-medium px-2 py-2"
                                    onClick={closeMobileMenu}
                                >
                                    Dashboard
                                </Link>
                            )}

                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="text-accent-warm hover:text-accent-warm/80 transition-colors font-medium px-2 py-2"
                                    onClick={closeMobileMenu}
                                >
                                    Admin
                                </Link>
                            )}

                            {user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                            {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-medium text-text-primary">
                                                {user.firstName || user.email}
                                            </div>
                                            <div className="text-xs uppercase tracking-wider text-text-muted">
                                                {user.role}
                                            </div>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-left px-2 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary-light text-white rounded-lg hover:opacity-90 transition-opacity text-center"
                                    onClick={closeMobileMenu}
                                >
                                    Sign In
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
