'use client';

import { useEffect, useState } from 'react';
import { Receipt, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, formatRupees } from '@/lib/subscription';

const STATUS_STYLES = {
  paid: { cls: 'text-emerald-700 bg-emerald-50 border-emerald-100', Icon: CheckCircle2 },
  failed: { cls: 'text-red-700 bg-red-50 border-red-100', Icon: XCircle },
  created: { cls: 'text-amber-700 bg-amber-50 border-amber-100', Icon: Clock },
  refunded: { cls: 'text-slate-700 bg-slate-50 border-slate-200', Icon: Receipt },
};

/** Past payments and granted access windows for the logged-in user. */
export default function BillingHistory() {
  const { t, lang } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/subscription/history')
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) setData({ orders: [], subscriptions: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="card flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" aria-hidden />
      </div>
    );
  }

  const orders = data?.orders || [];
  const grants = (data?.subscriptions || []).filter((s) => s.source !== 'razorpay');

  if (!orders.length && !grants.length) {
    return (
      <div className="card text-center text-sm text-gray-400">{t('sub_history_empty')}</div>
    );
  }

  return (
    <div className="card space-y-2.5">
      <h3 className="flex items-center gap-2 font-bold text-gray-800">
        <Receipt size={18} className="text-primary-600" aria-hidden />
        {t('sub_history_title')}
      </h3>

      {orders.map((order) => {
        const style = STATUS_STYLES[order.status] || STATUS_STYLES.created;
        const { Icon } = style;
        return (
          <div
            key={`o-${order.id}`}
            className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-800">
                {lang === 'hi' ? order.planNameHi : order.planName}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(order.paidAt || order.createdAt, lang)}
                {order.paymentId && <span className="ml-1.5 text-gray-400">· {order.paymentId}</span>}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-bold text-gray-900">{formatRupees(order.amount)}</p>
              <span
                className={`mt-0.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${style.cls}`}
              >
                <Icon size={11} aria-hidden />
                {t(`sub_order_status_${order.status}`)}
              </span>
            </div>
          </div>
        );
      })}

      {grants.map((grant) => (
        <div
          key={`s-${grant.id}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-200 px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-700">
              {grant.source === 'legacy' ? t('sub_grant_founder') : t('sub_grant_manual')}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(grant.startsAt, lang)} — {formatDate(grant.endsAt, lang)}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            {t('sub_grant_free')}
          </span>
        </div>
      ))}
    </div>
  );
}
