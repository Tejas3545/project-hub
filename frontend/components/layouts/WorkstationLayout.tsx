'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAuth } from '@/lib/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';

interface WorkstationLayoutProps {
  children: ReactNode;
}

export default function WorkstationLayout({ children }: WorkstationLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const initSidebar = () => {
      setMounted(true);
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) {
        setIsSidebarOpen(saved === 'true');
      }
    };
    initSidebar();
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    // On mobile: toggle overlay drawer
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      // On desktop: toggle collapse
      const newState = !isSidebarOpen;
      setIsSidebarOpen(newState);
      localStorage.setItem('sidebarOpen', String(newState));
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[200] flex bg-secondary/30 font-sans text-foreground overflow-hidden">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[250] md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, visible on md+ */}
      <div
        className={`
          fixed md:relative z-[260] h-full
          transition-transform duration-300 ease-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <Sidebar isOpen={isSidebarOpen} isMobile={isMobileSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <DashboardHeader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function Sidebar({ isOpen, isMobile, toggleSidebar }: { isOpen: boolean; isMobile: boolean; toggleSidebar: () => void }) {
  const pathname = usePathname();

  // On mobile, sidebar is always expanded (full-width drawer)
  const expanded = isMobile || isOpen;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'grid_view' },
    { name: 'Explore', href: '/projects', icon: 'explore' },
    { name: 'My Projects', href: '/workspace', icon: 'folder_open' },
    { name: 'Domains', href: '/domains', icon: 'category' },
    { name: 'Learning Paths', href: '/learning-paths', icon: 'school' },
    { name: 'Achievements', href: '/achievements', icon: 'emoji_events' },
  ];

  return (
    <aside
      className={`relative h-full flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 bg-background border-r border-border
        ${expanded ? 'w-72' : 'w-24'}`}
    >
      {/* Brand Section */}
      <div className={`h-20 flex items-center mb-4 ${expanded ? 'px-6' : 'justify-center px-2'}`}>
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center text-white shrink-0 shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-all duration-300">
            <span className="material-symbols-outlined text-2xl font-light">hub</span>
          </div>
          <div className={`transition-all duration-500 flex flex-col ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'}`}>
            <span className="text-xl font-bold tracking-tight text-foreground leading-tight">
              Project<span className="text-primary">Hub</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Student Portal</span>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <div className={`flex-1 space-y-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-2 ${expanded ? 'px-4' : 'px-2 flex flex-col items-center'}`}>
        <div className={`mb-4 px-4 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground transition-all duration-300 ${expanded ? 'opacity-100' : 'opacity-0 h-0 mb-0 overflow-hidden'}`}>
          Main menu
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${expanded ? 'px-4' : 'px-3 justify-center w-full'} ${isActive
                ? 'bg-secondary text-primary shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
            >
              <div className={`flex items-center justify-center size-5 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <span className="material-symbols-outlined text-[22px] font-light">
                  {item.icon}
                </span>
              </div>

              <span className={`text-[14px] font-semibold tracking-wide transition-all duration-500 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}>
                {item.name}
              </span>

              {!expanded && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-foreground text-background text-[12px] font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-[100] shadow-2xl translate-x-1 group-hover:translate-x-0 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* System Section */}
      <div className={`py-6 border-t border-border bg-secondary/10 ${expanded ? 'px-4' : 'px-2 flex flex-col items-center'}`}>
        <div className={`mb-4 px-4 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground transition-all duration-300 ${expanded ? 'opacity-100' : 'opacity-0 h-0 mb-0 overflow-hidden'}`}>
          System
        </div>

        <div className="space-y-1">
          <Link
            href="/profile"
            className={`flex items-center gap-4 py-3.5 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-300 group relative ${expanded ? 'px-4' : 'px-3 justify-center w-full'}`}
          >
            <div className="flex items-center justify-center size-5 group-hover:rotate-45 transition-transform duration-500">
              <span className="material-symbols-outlined text-[22px] font-light">settings</span>
            </div>
            <span className={`text-[14px] font-semibold tracking-wide transition-all duration-500 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}>
              Settings
            </span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`w-full flex items-center gap-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all duration-300 group relative ${expanded ? 'px-4' : 'px-3 justify-center'}`}
          >
            <div className="flex items-center justify-center size-5 group-hover:-translate-x-0.5 transition-transform duration-300">
              <span className="material-symbols-outlined text-[22px] font-light">logout</span>
            </div>
            <span className={`text-[14px] font-semibold tracking-wide transition-all duration-500 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}>
              Log Out
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function DashboardHeader({ isSidebarOpen, toggleSidebar }: { isSidebarOpen: boolean; toggleSidebar: () => void }) {
  const { data: session } = useSession();
  const { user } = useAuth();

  const userName = session?.user?.name || user?.firstName || 'User';
  const userImage = session?.user?.image || user?.profileImage;

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="size-10 flex items-center justify-center rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-primary transition-all active:scale-95 border border-transparent hover:border-border"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative">
          <NotificationBell />
        </div>

        <div className="h-6 w-px bg-border mx-1"></div>

        <div>
          <ThemeToggle />
        </div>

        <div className="h-6 w-px bg-border mx-1"></div>

        <Link href="/profile" className="flex items-center gap-3 hover:bg-secondary/30 p-1.5 rounded-xl transition-colors">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-none">{userName}</p>
          </div>
          {userImage ? (
            <img
              src={userImage}
              alt="Profile"
              className="size-8 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="size-8 rounded-full bg-muted/50 border border-border flex items-center justify-center text-muted-foreground">
              <span className="material-symbols-outlined text-lg">person</span>
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
