'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalizePhone, sanitizePhoneInput, isValidPhone, PHONE_LENGTH } from '@/lib/validation';
import AuthBrandHeader from '@/components/AuthBrandHeader';
import AuthPageLayout from '@/components/AuthPageLayout';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, lang, switchLang } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanedPhone = normalizePhone(phone);
    if (!isValidPhone(cleanedPhone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    try {
      await login(cleanedPhone, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      onSwitchLang={() => switchLang(lang === 'en' ? 'hi' : 'en')}
      langLabel={lang === 'en' ? 'हिंदी' : 'English'}
    >
      <AuthBrandHeader subtitle={t('login_subtitle')} />

      <div className="mt-8 pt-8 border-t border-slate-100/90">
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 text-left bg-red-50 text-red-800 border border-red-100/90 px-4 py-3.5 rounded-xl text-sm font-medium shadow-sm shadow-red-900/[0.04]"
            >
              <AlertCircle className="flex-shrink-0 text-red-500 mt-0.5" size={18} aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            <input
              type="tel"
              placeholder={t('phone')}
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              className="auth-field"
              inputMode="numeric"
              autoComplete="tel"
              pattern="\d{10}"
              maxLength={PHONE_LENGTH}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            <input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-field"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit mt-1">
            <LogIn size={22} strokeWidth={2.25} />
            {loading ? t('loading') : t('login')}
          </button>

          <p className="text-center text-slate-500 text-[0.9375rem] leading-relaxed mt-8 pt-6 border-t border-slate-100/90">
            {t('no_account')}{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="auth-link py-2 px-1.5 -my-2 rounded-lg hover:bg-primary-50/80 transition-colors"
            >
              {t('register')}
            </button>
          </p>
        </form>
      </div>
    </AuthPageLayout>
  );
}
