'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Send, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalizePhone, sanitizePhoneInput, isValidPhone, PHONE_LENGTH } from '@/lib/validation';
import AuthBrandHeader from '@/components/AuthBrandHeader';
import AuthPageLayout from '@/components/AuthPageLayout';

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { t, lang, switchLang } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    const cleanedPhone = normalizePhone(phone);
    if (!isValidPhone(cleanedPhone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { phone: cleanedPhone });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      onSwitchLang={() => switchLang(lang === 'en' ? 'hi' : 'en')}
      langLabel={lang === 'en' ? 'हिंदी' : 'English'}
    >
      <AuthBrandHeader subtitle={submitted ? null : t('forgot_password_subtitle')} />

      {submitted ? (
        <div className="w-full mt-5 flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-100">
            <CheckCircle className="text-green-500" size={36} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">{t('forgot_password_success_title')}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{t('forgot_password_success_body')}</p>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed px-2">{t('forgot_password_note')}</p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="auth-submit mt-1"
          >
            <ArrowLeft size={20} />
            {t('forgot_password_back_to_login')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full mt-5 space-y-3.5">
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
            <Phone
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-600/50 pointer-events-none"
              size={20}
            />
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

          <button type="submit" disabled={loading} className="auth-submit">
            <Send size={20} strokeWidth={2.25} />
            {loading ? t('loading') : t('forgot_password_submit')}
          </button>

          <p className="text-center text-gray-600 text-[0.9375rem] sm:text-base pt-4 mt-1 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="auth-link py-1 px-0.5 rounded hover:bg-primary-50 transition-colors"
            >
              {t('forgot_password_back_to_login')}
            </button>
          </p>
        </form>
      )}
    </AuthPageLayout>
  );
}
