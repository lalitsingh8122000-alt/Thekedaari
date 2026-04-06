'use client';
import AppShell from '@/components/AppShell';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  Headphones,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const CONTACT_EMAIL = 'LALITSINGH8122000@gmail.com';
const PHONE_1 = '6377518112';
const PHONE_2 = '7378255250';
const WHATSAPP_1 = `https://wa.me/91${PHONE_1}`;
const WHATSAPP_2 = `https://wa.me/91${PHONE_2}`;

export default function ContactUsPage() {
  const { lang, t } = useLanguage();
  const hi = lang === 'hi';
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto pb-24">
        {/* Hero Header */}
        <div className="relative -mx-4 -mt-4 mb-6 overflow-hidden rounded-b-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-6 pt-8 pb-10 text-white shadow-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
          <div className="relative z-10 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Headphones size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {hi ? 'हमसे संपर्क करें' : 'Contact Us'}
            </h1>
            <p className="text-sm text-blue-100 max-w-xs leading-relaxed">
              {hi
                ? 'कोई भी सवाल या मदद के लिए हमसे जुड़ें। हम जल्द जवाब देंगे।'
                : 'Reach out for any questions or support. We respond quickly.'}
            </p>
          </div>
        </div>

        {/* Phone Cards */}
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
            {hi ? 'फ़ोन नंबर' : 'Phone Numbers'}
          </h2>
          <div className="space-y-3">
            {[
              { number: PHONE_1, whatsapp: WHATSAPP_1, label: hi ? 'प्राथमिक नंबर' : 'Primary Number' },
              { number: PHONE_2, whatsapp: WHATSAPP_2, label: hi ? 'वैकल्पिक नंबर' : 'Alternate Number' },
            ].map(({ number, whatsapp, label }) => (
              <div
                key={number}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="flex items-center gap-4 px-4 py-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-lg font-bold text-gray-800 tracking-wide">{number}</p>
                  </div>
                </div>
                <div className="border-t border-gray-50 grid grid-cols-2 divide-x divide-gray-50">
                  <a
                    href={`tel:${number}`}
                    className="flex items-center justify-center gap-2 py-3 text-primary-600 font-semibold text-sm active:bg-primary-50 transition-colors"
                  >
                    <Phone size={15} />
                    {hi ? 'कॉल करें' : 'Call'}
                  </a>
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 text-green-600 font-semibold text-sm active:bg-green-50 transition-colors"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Email Card */}
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
            {hi ? 'ईमेल' : 'Email'}
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium">
                  {hi ? 'ईमेल पता' : 'Email Address'}
                </p>
                <p className="text-sm font-bold text-gray-800 break-all">{CONTACT_EMAIL}</p>
              </div>
            </div>
            <div className="border-t border-gray-50 grid grid-cols-2 divide-x divide-gray-50">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center justify-center gap-2 py-3 text-orange-500 font-semibold text-sm active:bg-orange-50 transition-colors"
              >
                <Send size={15} />
                {hi ? 'ईमेल करें' : 'Send Email'}
              </a>
              <button
                onClick={copyEmail}
                className="flex items-center justify-center gap-2 py-3 text-gray-500 font-semibold text-sm active:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <span className="text-green-600 font-semibold text-sm">
                    {hi ? 'कॉपी हो गया ✓' : 'Copied ✓'}
                  </span>
                ) : (
                  <>
                    <ChevronRight size={15} />
                    {hi ? 'कॉपी करें' : 'Copy'}
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Support Hours */}
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
            {hi ? 'सहायता समय' : 'Support Hours'}
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 space-y-3">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-violet-500" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">
                  {hi ? 'सोमवार – शनिवार' : 'Monday – Saturday'}
                </p>
                <p className="text-gray-500 text-sm">9:00 AM – 7:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                <Building2 size={20} className="text-yellow-500" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">
                  {hi ? 'रविवार / छुट्टी' : 'Sunday / Holidays'}
                </p>
                <p className="text-gray-500 text-sm">
                  {hi ? 'WhatsApp पर संदेश छोड़ें' : 'Leave a WhatsApp message'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Help Note */}
        <div className="bg-primary-50 border border-primary-100 rounded-2xl px-4 py-4 flex gap-3 items-start">
          <MapPin size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary-700 leading-relaxed">
            {hi
              ? 'सबसे तेज़ जवाब के लिए WhatsApp पर मैसेज करें। ईमेल के जवाब में 24 घंटे तक लग सकते हैं।'
              : 'For the fastest response, message us on WhatsApp. Email replies may take up to 24 hours.'}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
