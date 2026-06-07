'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ProfileModal from './ProfileModal';
import WhatsNewBanner from './WhatsNewBanner';

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

  useEffect(() => {
    if (!sidebarOpen) return;
    const html = document.documentElement;
    const scrollY = window.scrollY || html.scrollTop;
    const prev = {
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyLeft: document.body.style.left,
      bodyRight: document.body.style.right,
      bodyWidth: document.body.style.width,
      bodyOverflow: document.body.style.overflow,
      htmlOverflow: html.style.overflow,
    };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    return () => {
      document.body.style.position = prev.bodyPosition;
      document.body.style.top = prev.bodyTop;
      document.body.style.left = prev.bodyLeft;
      document.body.style.right = prev.bodyRight;
      document.body.style.width = prev.bodyWidth;
      document.body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [sidebarOpen]);

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
      <BottomNav sidebarOpen={sidebarOpen} />
      <ProfileModal open={profileModalOpen} onClose={closeProfileModal} />
      <WhatsNewBanner />
    </div>
  );
}
