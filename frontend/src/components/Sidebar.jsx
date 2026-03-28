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
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const menuItems = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'attendance', path: '/attendance', icon: CalendarCheck },
  { key: 'projects', path: '/projects', icon: FolderKanban },
  { key: 'workers', path: '/workers', icon: Users, subtitle: 'master_data' },
  { key: 'roles', path: '/roles', icon: ShieldCheck },
  { key: 'transactions', path: '/transactions', icon: ArrowLeftRight },
  { key: 'profile', path: '/profile', icon: UserCircle },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const navigate = (path) => {
    router.push(path);
    onClose();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="bg-primary-600 text-white p-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('app_name')}</h2>
          <button onClick={onClose} className="p-1 rounded-lg active:bg-primary-700">
            <X size={24} />
          </button>
        </div>
        <nav className="p-3">
          {menuItems.map(({ key, path, icon: Icon, subtitle }) => {
            const active = pathname.startsWith(path);
            return (
              <button
                key={key}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg mb-1 transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-gray-600 active:bg-gray-100'
                }`}
              >
                <Icon size={24} />
                <div>
                  <span>{t(key)}</span>
                  {subtitle && <p className="text-xs text-gray-400 font-normal">{t(subtitle)}</p>}
                </div>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
