'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/lib/store/ui-store';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import {
  LayoutDashboard,
  UserCircle,
  Activity,
  BrainCircuit,
  Baby,
  Bell,
  Stethoscope,
  Cpu,
  AlertTriangle,
  FileText,
  History,
  ChevronLeft,
  Heart,
  X,
  Sun,
  Mic,
  AudioWaveform,
} from 'lucide-react';
import { useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/profile', icon: <UserCircle className="h-5 w-5" /> },
  { label: 'Health Tracking', href: '/dashboard/tracking', icon: <Activity className="h-5 w-5" /> },
  { label: 'AI Intelligence', href: '/dashboard/ai-intelligence', icon: <BrainCircuit className="h-5 w-5" /> },
  { label: 'Multiple Pregnancy', href: '/dashboard/multiple-pregnancy', icon: <Baby className="h-5 w-5" /> },
  { label: 'Reminders', href: '/dashboard/reminders', icon: <Bell className="h-5 w-5" /> },
  { label: 'Postnatal Care', href: '/dashboard/postnatal', icon: <Stethoscope className="h-5 w-5" /> },
  { label: 'Baby Intelligence', href: '/dashboard/baby-intelligence', icon: <Cpu className="h-5 w-5" /> },
  { label: 'Emergency', href: '/dashboard/emergency', icon: <AlertTriangle className="h-5 w-5" /> },
  { label: 'Jaundice Detection', href: '/dashboard/jaundice-detection', icon: <Sun className="h-5 w-5" /> },
  { label: 'Voice Triage', href: '/dashboard/voice-triage', icon: <Mic className="h-5 w-5" /> },
  { label: 'Cry Analysis', href: '/dashboard/cry-analysis', icon: <AudioWaveform className="h-5 w-5" /> },
  { label: 'Reports', href: '/dashboard/reports', icon: <FileText className="h-5 w-5" /> },
  { label: 'Lifecycle', href: '/dashboard/lifecycle', icon: <History className="h-5 w-5" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isDesktop, setSidebarOpen]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-100 px-6 dark:border-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600">
          <Heart className="h-4 w-4 text-white" />
        </div>
        {sidebarOpen && (
          <>
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              MamaCare
            </span>
            <span className="rounded bg-pink-100 px-1.5 py-0.5 text-[10px] font-medium text-pink-600 dark:bg-pink-900/40 dark:text-pink-400">
              AI
            </span>
          </>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => !isDesktop && setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                  )}
                >
                  {item.icon}
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
            !sidebarOpen && 'justify-center'
          )}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 transition-transform',
              !sidebarOpen && 'rotate-180'
            )}
          />
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  if (!isDesktop) {
    if (!sidebarOpen) return null;
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl dark:bg-zinc-900 lg:hidden">
          <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-4 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">MamaCare</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        'hidden h-screen border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 lg:sticky lg:top-0 lg:flex lg:flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {sidebarContent}
    </aside>
  );
}

