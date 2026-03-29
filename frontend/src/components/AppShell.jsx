'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ProfileModal from './ProfileModal';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicPages = ['/login', '/register'];
  const isPublic = publicPages.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.push('/login');
    }
  }, [user, loading, isPublic, router]);

  useEffect(() => {
    if (pathname === '/profile') {
      setProfileModalOpen(true);
    }
  }, [pathname]);

  const closeProfileModal = () => {
    setProfileModalOpen(false);
    if (pathname === '/profile') {
      router.replace('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (isPublic) return <>{children}</>;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onProfileOpen={() => setProfileModalOpen(true)}
      />
      <main className="page-content p-4 max-w-4xl mx-auto">{children}</main>
      <BottomNav />
      <ProfileModal open={profileModalOpen} onClose={closeProfileModal} />
    </div>
  );
}
