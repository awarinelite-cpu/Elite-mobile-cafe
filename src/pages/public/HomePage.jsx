import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, CreditCard, Download, ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { CATEGORIES } from '../components/common/StatusHelpers';

export default function HomePage() {
  const navigate = useNavigate();

  const steps = [
    { icon: <BookOpen size={28} />, num: '01', title: 'Browse or Request', desc: 'Choose from our curated research topics or submit your own custom research request with full details.' },
    { icon: <MessageSquare size={28} />, num: '02', title: 'Negotiate & Agree', desc: 'Our team reviews your request and proposes a price. Chat directly to fine-tune scope, deadline and cost.' },
    { icon: <CreditCard size={28} />, num: '03', title: 'Pay Advance', desc: 'Confirm the project with a partial advance payment. Work begins immediately after confirmation.' },
    { icon: <Download size={28} />, num: '04', title: 'Pay Balance & Download', desc: 'Once your research is delivered, complete the final payment to unlock and download your document.' },
  ];

  const features = [
    { icon: <Star size={22} />, title: 'Expert Researchers', desc: 'Every piece is handled by subject-matter specialists with verified academic credentials.' },
    { icon: <Shield size={22} />, title: '100% Original', desc: 'All research is written from scratch, plagiarism-checked and tailored to your specifications.' },
    { icon: <Clock size={22} />, title: 'On-Time Delivery', desc: 'We respect your deadlines. Transparent timelines agreed upfront, status updates throughout.' },
  ];

  const categories = [
    { label: 'Academic', icon: '🎓', desc: 'Essays, dissertations, theses, research papers' },
    { label: 'Corporate', icon: '💼', desc: 'Market research, reports, white papers' },
    { label: 'Medical', icon: '🩺', desc: 'Clinical studies, health sciences, case reports' },
    { label: 'General', icon: '📖', desc: 'All topics, blog content, analysis' },
  ];

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{
        background: `linear-gradient(135deg, var(--forest-dark) 0%, var(--forest) 60%, var(--forest-mid) 100%)`,
        padding: 'clamp(60px, 10vw, 120px) 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(201,168,76,0.08)', pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 700 }}>
            <span className="section-eyebrow animate-fade-up">Research · Writing · Delivery</span>
            <h1 style={{ color: 'var(--cream)', marginBottom: 24, animationDelay: '0.1s' }} className="animate-fade-up">
              Premium Research,<br />
              <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Delivered to You</em>
            </h1>
            <p style={{ color: 'rgba(245,240,227,0.8)', fontSize: '1.15rem', maxWidth: 560, marginBottom: 40, lineHeight: 1.7 }} className="animate-fade-up">
              Academic, corporate, medical and general research — written by experts, negotiated with you, secured by our payment-gated delivery system.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }} className="animate-fade-up">
              <button className="btn btn-gold btn-lg" onClick={() => navigate('/topics')}>
                Browse Topics <ArrowRight size={18} />
              </button>
              <button className="btn btn-outline btn-lg" style={{ color: 'var(--cream)', borderColor: 'rgba(245,240,227,0.4)' }} onClick={() => navigate('/request')}>
                Custom Request
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ padding: '72px 0', background: 'var(--cream-dark)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-eyebrow">What We Cover</span>
            <h2>Research Across Every Domain</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {categories.map(cat => (
              <button key={cat.label} className="card card-pad" onClick={() => navigate(`/topics?category=${cat.label}`)}
                style={{ textAlign: 'left', cursor: 'pointer', border: 'none', transition: 'all 0.22s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{cat.icon}</div>
                <h4 style={{ marginBottom: 6 }}>{cat.label}</h4>
                <p style={{ fontSize: '0.87rem', color: 'var(--muted)' }}>{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '88px 0' }} id="how-it-works">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="section-eyebrow">Simple Process</span>
            <h2>How It Works</h2>
            <p style={{ color: 'var(--muted)', marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>
              Four straightforward steps from request to delivery — with full payment protection built in.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, position: 'relative' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div className="card card-pad" style={{ height: '100%' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12,
                    background: i === 3 ? 'var(--forest)' : 'var(--gold-pale)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: i === 3 ? 'var(--cream)' : 'var(--forest)',
                    marginBottom: 18,
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gold)', marginBottom: 8, letterSpacing: '0.1em' }}>
                    STEP {step.num}
                  </div>
                  <h4 style={{ marginBottom: 10 }}>{step.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.65 }}>{step.desc}</p>
                  {i === 3 && (
                    <div style={{
                      marginTop: 14, padding: '8px 12px', background: 'var(--gold-pale)',
                      borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: '0.8rem', color: 'var(--forest)', fontWeight: 600,
                    }}>
                      🔒 Download locked until final payment
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '72px 0', background: 'var(--forest-dark)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, background: 'rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <h4 style={{ color: 'var(--cream)', marginBottom: 8 }}>{f.title}</h4>
                  <p style={{ color: 'rgba(245,240,227,0.65)', fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 0', background: 'var(--gold-pale)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-eyebrow">Get Started Today</span>
          <h2 style={{ marginBottom: 16 }}>Ready to Order Your Research?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Join clients who trust The Elites Mobile Cafe for high-quality, expertly crafted research.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Create Free Account <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/topics')}>
              Browse Topics First
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--forest-dark)', color: 'rgba(245,240,227,0.5)', padding: '32px 24px', textAlign: 'center', fontSize: '0.85rem' }}>
        <div className="container">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--cream)', marginBottom: 8 }}>
            The Elites <span style={{ color: 'var(--gold)' }}>Mobile Cafe</span>
          </p>
          <p>© {new Date().getFullYear()} The Elites Mobile Cafe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
