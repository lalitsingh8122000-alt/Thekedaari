'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, FolderKanban, CalendarCheck, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'nav_attendance_report', path: '/attendance', icon: CalendarCheck },
  { key: 'workers', path: '/workers', icon: Users },
  { key: 'projects', path: '/projects', icon: FolderKanban },
];

export default function BottomNav({ sidebarOpen = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  /** Highlights the tab you tapped before the route finishes updating (feels instant on slow networks). */
  const [pendingPath, setPendingPath] = useState(null);

  useEffect(() => {
    navItems.forEach(({ path }) => router.prefetch(path));
  }, [router]);

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden transition-opacity duration-200 ${
        sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        zIndex: 40,
        paddingBottom: 'var(--safe-bottom)',
        paddingLeft: 'var(--safe-left)',
        paddingRight: 'var(--safe-right)',
      }}
    >
      <div className="flex justify-around items-center py-1">
        {navItems.map(({ key, path, icon: Icon }) => {
          const routeActive = pathname === path || pathname.startsWith(`${path}/`);
          const active = routeActive || pendingPath === path;
          return (
            <Link
              key={path}
              href={path}
              prefetch
              scroll
              aria-current={routeActive ? 'page' : undefined}
              onClick={() => setPendingPath(path)}
              className={`flex flex-col items-center py-2 px-3 min-w-[70px] rounded-xl select-none touch-manipulation
                transition-[transform,color,font-weight] duration-150 ease-out
                active:scale-95 active:opacity-90
                ${active ? 'text-primary-600' : 'text-gray-400'}`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5} className="shrink-0" />
              <span className={`text-xs mt-1 ${active ? 'font-bold' : 'font-medium'}`}>{t(key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
