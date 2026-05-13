'use client';
import { usePathname, useRouter } from 'next/navigation';
import {
  X,
  LayoutDashboard,
  FolderKanban,
  Users,
  ShieldCheck,
  ArrowLeftRight,
  CalendarCheck,
  UserCircle,
  BookOpen,
  Headphones,
  Store,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const menuItems = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'nav_attendance_report', path: '/attendance', icon: CalendarCheck },
  { key: 'projects', path: '/projects', icon: FolderKanban },
  { key: 'workers', path: '/workers', icon: Users, subtitle: 'master_data' },
  { key: 'vendors', path: '/vendors', icon: Store },
  { key: 'roles', path: '/roles', icon: ShieldCheck },
  { key: 'transactions', path: '/transactions', icon: ArrowLeftRight },
  { key: 'how_to_use', path: '/how-to-use', icon: BookOpen },
  { key: 'contact_us', path: '/contact-us', icon: Headphones },
  { key: 'profile', path: '/profile', icon: UserCircle },
];

export default function Sidebar({ open, onClose, onProfileOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const navigate = (path) => {
    if (path === '/profile' && onProfileOpen) {
      onProfileOpen();
      onClose();
      return;
    }
    router.push(path);
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[55] overscroll-none touch-none md:touch-auto"
          onClick={onClose}
          aria-hidden
          role="presentation"
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-[60] flex h-[100dvh] w-[min(20rem,calc(100vw-2.5rem))] sm:w-72 max-w-[min(24rem,calc(100vw-2rem))] flex-col bg-white shadow-2xl transform transition-transform duration-300 ease-out overscroll-contain ${
          open ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        aria-hidden={!open}
      >
        <div className="flex-shrink-0 bg-primary-600 text-white px-4 py-4 sm:p-5 flex items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold truncate">{t('app_name')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg active:bg-primary-700 flex-shrink-0 touch-manipulation"
            aria-label="Close menu"
          >
            <X size={22} aria-hidden />
          </button>
        </div>
        <nav
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-2 sm:p-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] [-webkit-overflow-scrolling:touch]"
        >
          {menuItems.map(({ key, path, icon: Icon, subtitle }) => {
            const active = pathname.startsWith(path);
            return (
              <button
                key={key}
                type="button"
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 sm:gap-4 px-3 py-3 sm:px-4 sm:py-3.5 rounded-xl text-left text-base sm:text-lg mb-0.5 sm:mb-1 transition-colors touch-manipulation ${
                  active
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-gray-600 active:bg-gray-100'
                }`}
              >
                <Icon size={22} className="flex-shrink-0" strokeWidth={active ? 2.25 : 2} />
                <div className="min-w-0">
                  <span className="leading-snug">{t(key)}</span>
                  {subtitle && (
                    <p className="text-xs text-gray-400 font-normal mt-0.5">{t(subtitle)}</p>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
