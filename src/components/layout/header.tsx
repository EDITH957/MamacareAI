'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import { useTheme } from '@/lib/hooks/use-theme';
import { useOnlineStatus } from '@/lib/hooks/use-online-status';
import { useT } from '@/lib/i18n/use-t';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import {
  Menu,
  Moon,
  Sun,
  LogOut,
  Wifi,
  WifiOff,
  Bell,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

export function Header() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const { t } = useT();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
            isOnline
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
          )}
        >
          {isOnline ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          {isOnline ? t('dashboard.online') : t('dashboard.offline')}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-sm font-medium text-pink-600 dark:bg-pink-900/40 dark:text-pink-400">
              {user?.fullName?.charAt(0) || <User className="h-4 w-4" />}
            </div>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-200 bg-white py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-4 py-2 dark:border-zinc-800">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {user?.fullName}
                </p>
                <p className="text-xs text-zinc-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push('/dashboard/profile');
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <User className="h-4 w-4" /> {t('dashboard.profile')}
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" /> {t('nav.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
