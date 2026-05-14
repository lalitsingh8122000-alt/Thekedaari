'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import LandingNavInstall from './LandingNavInstall';
import './landing-page.css';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Thekedaari — Construction Management App';
  }, []);

  return (
    <div className="landing-page">
      {/* NAV */}
      <nav className="landing-nav">
        <Link href="/" className="landing-nav-logo">
          <img src="/thekedaari-logo.png" alt="Thekedaari" className="landing-logo-img" />
          <span>Thekedaari</span>
        </Link>
        <ul className="landing-nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
          <li><Link href="/about-us">About</Link></li>
          <li><Link href="/blogs">Blog</Link></li>
        </ul>
        <div className="landing-nav-actions">
          <LandingNavInstall />
          <Link href="/login" className="landing-btn-outline-sm">Log In</Link>
          <Link href="/register" className="landing-btn-primary-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-left">
            <span className="landing-badge">Trusted by 500+ Contractors</span>
            <h1 className="landing-hero-title">
              Manage Your Construction Site
              <span className="landing-hero-highlight"> Effortlessly</span>
            </h1>
            <p className="landing-hero-subtitle">
              Track worker attendance, manage salaries, monitor project finances, and keep 
              complete records — all from your phone. No paper registers, no confusion.
            </p>
            <div className="landing-hero-actions">
              <Link href="/register" className="landing-btn-primary">
                Start Free — No Card Required
              </Link>
              <a href="#features" className="landing-btn-outline">
                See Features
              </a>
            </div>
            <div className="landing-hero-trust">
              <div className="landing-trust-item">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                <span>100% Free</span>
              </div>
              <div className="landing-trust-item">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                <span>Works Offline</span>
              </div>
              <div className="landing-trust-item">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                <span>Install on Phone</span>
              </div>
            </div>
          </div>
          <div className="landing-hero-right">
            <div className="landing-hero-phone">
              <img src="/landing/dashboard.png" alt="Thekedaari Dashboard" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="landing-stats-bar">
        <div className="landing-stats-inner">
          <div className="landing-stat">
            <span className="landing-stat-number">500+</span>
            <span className="landing-stat-label">Active Contractors</span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat-number">10,000+</span>
            <span className="landing-stat-label">Workers Managed</span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat-number">&#8377;2 Cr+</span>
            <span className="landing-stat-label">Salaries Tracked</span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat-number">99.9%</span>
            <span className="landing-stat-label">Uptime</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-features" id="features">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Everything a Contractor Needs</h2>
          <p className="landing-section-subtitle">
            From daily attendance to project finances — Thekedaari handles it all so you can focus on building.
          </p>
        </div>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon blue">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            </div>
            <h3>Daily Attendance</h3>
            <p>Mark Present, Absent, or Half Day with a single tap. Salary calculates automatically based on daily rate.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon green">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <h3>Worker Ledger</h3>
            <p>Complete transaction history for each worker — owed salary, paid amount, bonus, and current balance in one place.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon amber">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <h3>Project Management</h3>
            <p>Create multiple projects, assign workers, and track project-wise labour costs and finances with ease.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon red">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3>Finance Dashboard</h3>
            <p>See Total Income vs Expense, real-time Profit/Loss. Your money management stays crystal clear.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon purple">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
            <h3>Instant Payments</h3>
            <p>Record cash payments with attendance — add reason (medicine, ration, travel) for complete transparency.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon teal">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <h3>Worker Roles & Rates</h3>
            <p>Set different daily rates for Supervisors, Skilled Workers, and Labourers. No rate confusion ever.</p>
          </div>
        </div>
      </section>

      {/* APP SCREENSHOTS */}
      <section className="landing-screens" id="screens">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Simple, Clean & Easy to Use</h2>
          <p className="landing-section-subtitle">
            Designed for real construction sites — fast, intuitive, and works on any phone.
          </p>
        </div>
        <div className="landing-screens-grid">
          <div className="landing-screen-item">
            <div className="landing-phone-mockup">
              <img src="/landing/dashboard.png" alt="Dashboard" />
            </div>
            <span>Dashboard</span>
          </div>
          <div className="landing-screen-item">
            <div className="landing-phone-mockup">
              <img src="/landing/attendance.png" alt="Attendance" />
            </div>
            <span>Attendance</span>
          </div>
          <div className="landing-screen-item">
            <div className="landing-phone-mockup">
              <img src="/landing/workers.png" alt="Workers" />
            </div>
            <span>Workers</span>
          </div>
          <div className="landing-screen-item">
            <div className="landing-phone-mockup">
              <img src="/landing/ledger.png" alt="Ledger" />
            </div>
            <span>Ledger</span>
          </div>
          <div className="landing-screen-item">
            <div className="landing-phone-mockup">
              <img src="/landing/projects.png" alt="Projects" />
            </div>
            <span>Projects</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-how" id="how-it-works">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Get Started in 4 Simple Steps</h2>
          <p className="landing-section-subtitle">
            No training needed. No complex setup. Start managing your site in under 5 minutes.
          </p>
        </div>
        <div className="landing-how-grid">
          <div className="landing-how-step">
            <div className="landing-how-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up free with your phone number. No documents required.</p>
          </div>
          <div className="landing-how-step">
            <div className="landing-how-number">2</div>
            <h3>Add Workers</h3>
            <p>Enter worker name, role (Skilled/Labour/Supervisor) and daily rate.</p>
          </div>
          <div className="landing-how-step">
            <div className="landing-how-number">3</div>
            <h3>Mark Attendance</h3>
            <p>Mark present or absent daily. Salary calculates automatically.</p>
          </div>
          <div className="landing-how-step">
            <div className="landing-how-number">4</div>
            <h3>Track & Pay</h3>
            <p>View ledger, record payments, and monitor project finances.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="landing-testimonials" id="testimonials">
        <div className="landing-section-header">
          <h2 className="landing-section-title">What Contractors Say</h2>
          <p className="landing-section-subtitle">
            Real users from real construction sites across India.
          </p>
        </div>
        <div className="landing-testimonials-grid">
          <div className="landing-testimonial-card">
            <div className="landing-testimonial-stars">★★★★★</div>
            <p>&ldquo;Earlier I used paper registers for everything. Now everything is done in a minute. Salary calculation is automatic — saves so much time.&rdquo;</p>
            <div className="landing-testimonial-author">
              <div className="landing-testimonial-avatar" style={{background: '#2563EB'}}>R</div>
              <div>
                <strong>Ramesh Kumar</strong>
                <span>Civil Contractor, Jaipur</span>
              </div>
            </div>
          </div>
          <div className="landing-testimonial-card">
            <div className="landing-testimonial-stars">★★★★★</div>
            <p>&ldquo;I manage 3 sites with 30+ workers. Thekedaari keeps track of every rupee — who was paid, who is owed. Perfect app for contractors like me.&rdquo;</p>
            <div className="landing-testimonial-author">
              <div className="landing-testimonial-avatar" style={{background: '#059669'}}>S</div>
              <div>
                <strong>Suresh Patel</strong>
                <span>Building Contractor, Ahmedabad</span>
              </div>
            </div>
          </div>
          <div className="landing-testimonial-card">
            <div className="landing-testimonial-stars">★★★★★</div>
            <p>&ldquo;The Ledger feature is incredibly useful — every payment and balance is crystal clear. My workers trust the system too.&rdquo;</p>
            <div className="landing-testimonial-author">
              <div className="landing-testimonial-avatar" style={{background: '#D97706'}}>M</div>
              <div>
                <strong>Mohan Singh</strong>
                <span>Site Supervisor, Delhi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta-inner">
          <h2>Ready to Simplify Your Site Management?</h2>
          <p>Join 500+ contractors who have ditched paper registers. Free forever, no credit card needed.</p>
          <div className="landing-cta-actions">
            <Link href="/register" className="landing-btn-primary">
              Create Free Account
            </Link>
            <Link href="/login" className="landing-btn-white">
              Already have an account? Log In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-top">
          <div className="landing-footer-brand">
            <div className="landing-nav-logo">
              <img src="/thekedaari-logo.png" alt="Thekedaari" className="landing-logo-img" />
              <span>Thekedaari</span>
            </div>
            <p>Smart construction management app for Indian contractors. Workers, attendance, salary, and project finance — all in one place.</p>
          </div>
          <div className="landing-footer-col">
            <h5>Product</h5>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#screens">App Screens</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><Link href="/login">Install App</Link></li>
            </ul>
          </div>
          <div className="landing-footer-col">
            <h5>Account</h5>
            <ul>
              <li><Link href="/login">Log In</Link></li>
              <li><Link href="/register">Register Free</Link></li>
              <li><Link href="/login">Forgot Password</Link></li>
            </ul>
          </div>
          <div className="landing-footer-col">
            <h5>Company</h5>
            <ul>
              <li><Link href="/about-us">About Us</Link></li>
              <li><Link href="/blogs">Blog</Link></li>
              <li><Link href="/contact-us">Contact Us</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="landing-footer-col">
            <h5>Contact</h5>
            <ul>
              <li><a href="tel:+917378255250">+91 7378255250</a></li>
              <li><a href="tel:+916377518112">+91 6377518112</a></li>
              <li><a href="https://wa.me/917378255250" className="landing-whatsapp-link">WhatsApp Chat</a></li>
            </ul>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>&copy; 2026 Thekedaari. All rights reserved.</p>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a href="https://wa.me/917378255250" className="landing-whatsapp-float" target="_blank" rel="noopener noreferrer">
        <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
