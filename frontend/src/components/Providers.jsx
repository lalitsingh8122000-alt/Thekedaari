'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import PWARegister from '@/components/PWARegister';

export default function Providers({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <PWARegister />
          {children}
        </SubscriptionProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
