'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const { t, lang, switchLang } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await registerUser(name, phone, password, confirmPassword);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-600 to-primary-800 flex flex-col">
      <div className="flex justify-end p-4">
        <button
          onClick={() => switchLang(lang === 'en' ? 'hi' : 'en')}
          className="bg-white/20 text-white font-semibold px-4 py-2 rounded-full text-sm"
        >
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🏗️</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{t('app_name')}</h1>
          <p className="text-primary-200 mt-2 text-lg">{t('register_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field pl-12 text-lg"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="tel"
              placeholder={t('phone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field pl-12 text-lg"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-12 text-lg"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder={t('confirm_password')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field pl-12 text-lg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <UserPlus size={22} />
            {loading ? t('loading') : t('register')}
          </button>

          <p className="text-center text-primary-200 text-base">
            {t('have_account')}{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-white font-bold underline"
            >
              {t('login')}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
