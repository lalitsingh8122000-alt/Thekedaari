'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Lock, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalizePhone, sanitizePhoneInput, isValidPhone, PHONE_LENGTH } from '@/lib/validation';
import AuthBrandHeader from '@/components/AuthBrandHeader';
import AuthPageLayout from '@/components/AuthPageLayout';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerUser, user, loading: authLoading } = useAuth();
  const { t, lang, switchLang } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanedPhone = normalizePhone(phone);
    if (!isValidPhone(cleanedPhone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await registerUser(name.trim(), cleanedPhone, password, confirmPassword);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthPageLayout
      onSwitchLang={() => switchLang(lang === 'en' ? 'hi' : 'en')}
      langLabel={lang === 'en' ? 'हिंदी' : 'English'}
    >
      <AuthBrandHeader subtitle={t('register_subtitle')} />

      <form onSubmit={handleSubmit} className="w-full mt-5 space-y-3">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 text-left bg-red-50 text-red-800 border border-red-100 px-3 py-2 rounded-lg text-sm font-medium"
          >
            <AlertCircle className="flex-shrink-0 text-red-500 mt-0.5" size={16} aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-600/50 pointer-events-none" size={20} />
          <input
            type="text"
            placeholder={t('name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-field"
            autoComplete="name"
            required
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-600/50 pointer-events-none" size={20} />
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
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-600/50 pointer-events-none" size={20} />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-field"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-600/50 pointer-events-none" size={20} />
          <input
            type="password"
            placeholder={t('confirm_password')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="auth-field"
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="auth-submit">
          <UserPlus size={22} strokeWidth={2.25} />
          {loading ? t('loading') : t('register')}
        </button>

        <p className="text-center text-gray-600 text-[0.9375rem] sm:text-base pt-4 mt-1 border-t border-gray-100">
          {t('have_account')}{' '}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="auth-link py-1 px-0.5 rounded hover:bg-primary-50 transition-colors"
          >
            {t('login')}
          </button>
        </p>
      </form>
    </AuthPageLayout>
  );
}
