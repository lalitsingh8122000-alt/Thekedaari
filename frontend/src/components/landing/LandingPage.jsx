'use client';

import { useEffect, useRef } from 'react';
import { landingBodyHtml } from './landingBodyHtml';
import './landing-page.css';

export default function LandingPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    document.title = 'Thekedaari — Construction Management App';
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('landing-scroll');
    return () => document.documentElement.classList.remove('landing-scroll');
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const revealEls = root.querySelectorAll('.reveal');
    const revObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('show');
        });
      },
      { threshold: 0.1 }
    );
    revealEls.forEach((el) => revObs.observe(el));

    function animateCounter(el) {
      const target = parseInt(el.dataset.target, 10);
      const prefix = el.dataset.prefix || '';
      const dur = 2000;
      let start = null;
      function finalText() {
        if (el.dataset.suffix !== undefined) {
          return `${prefix}${target}${el.dataset.suffix}`;
        }
        if (target >= 1000) {
          return `${prefix}${(target / 1000).toFixed(0)}K+`;
        }
        return `${prefix}${target}+`;
      }
      function step(ts) {
        if (!start) start = ts;
        const prog = Math.min((ts - start) / dur, 1);
        const ease = 1 - (1 - prog) ** 3;
        const val = Math.floor(ease * target);
        const midSuffix = el.dataset.suffix !== undefined ? el.dataset.suffix : '+';
        el.textContent =
          prefix +
          (val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K` : String(val)) +
          midSuffix;
        if (prog < 1) requestAnimationFrame(step);
        else {
          el.textContent = finalText();
        }
      }
      requestAnimationFrame(step);
    }

    const statEls = root.querySelectorAll('.stat-n[data-target]');
    const statObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          if (el.dataset.suffix === 'Cr+') {
            el.textContent = '₹2Cr+';
          } else if (el.dataset.suffix === '.9%') {
            el.textContent = '99+';
            setTimeout(() => {
              el.textContent = '99.9%';
            }, 800);
          } else {
            animateCounter(el);
          }
          statObs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    statEls.forEach((el) => statObs.observe(el));

    const onScroll = () => {
      const nav = root.querySelector('nav');
      if (!nav) return;
      nav.style.background = window.scrollY > 50 ? 'rgba(8,12,20,0.95)' : 'rgba(8,12,20,0.8)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      revObs.disconnect();
      statObs.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="landing-scope"
      dangerouslySetInnerHTML={{ __html: landingBodyHtml }}
    />
  );
}
