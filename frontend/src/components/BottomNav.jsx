'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Users, FolderKanban, CalendarCheck, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'attendance', path: '/attendance', icon: CalendarCheck },
  { key: 'workers', path: '/workers', icon: Users },
  { key: 'projects', path: '/projects', icon: FolderKanban },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden"
      style={{
        zIndex: 40,
        paddingBottom: 'var(--safe-bottom)',
        paddingLeft: 'var(--safe-left)',
        paddingRight: 'var(--safe-right)',
      }}
    >
      <div className="flex justify-around items-center py-1">
        {navItems.map(({ key, path, icon: Icon }) => {
          const active = pathname.startsWith(path);
          return (
            <button
              key={key}
              onClick={() => router.push(path)}
              className={`flex flex-col items-center py-2 px-3 min-w-[70px] rounded-lg transition-colors ${
                active ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5} />
              <span className={`text-xs mt-1 ${active ? 'font-bold' : 'font-medium'}`}>
                {t(key)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
