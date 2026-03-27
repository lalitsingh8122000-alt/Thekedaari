'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import PWARegister from '@/components/PWARegister';

export default function Providers({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <PWARegister />
        {children}
      </AuthProvider>
    </LanguageProvider>
  );
}
