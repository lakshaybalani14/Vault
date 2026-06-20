import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BlurText from '@/components/shared/BlurText'
import { getFeedPosts } from '@/lib/actions/posts'
import DomeGallery from '@/components/shared/DomeGalleryWrapper'
import ScrollReveal from '@/components/shared/ScrollRevealWrapper'

export const metadata = {
  title: 'Vault — Lost & Found for VIT Vellore',
  description:
    'The student-built lost & found platform for VIT Vellore. Report lost items, claim found ones, and help your fellow students.',
}

export default async function HomePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/feed')

  const posts = await getFeedPosts({ status: 'open' })
  const activeDbImages = posts
    .filter(p => p.image_urls && p.image_urls.length > 0)
    .flatMap(p => p.image_urls.map(url => ({
      src: url,
      alt: p.title,
      location: p.found_at || 'VIT Campus'
    })))

  const FALLBACK_GALLERY_IMAGES = [
    {
      src: 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?q=80&w=600&auto=format&fit=crop',
      alt: 'AirPods Pro with White Case',
      location: 'SJT Second Floor Stairs'
    },
    {
      src: 'https://images.unsplash.com/photo-1574607383476-f517f220d398?q=80&w=600&auto=format&fit=crop',
      alt: 'Casio Scientific Calculator',
      location: 'Central Library Study Cabin'
    },
    {
      src: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop',
      alt: 'Decathlon Water Bottle',
      location: 'SJT Ground Floor Cafeteria'
    },
    {
      src: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=600&auto=format&fit=crop',
      alt: 'Hostel Room Keys',
      location: 'MH-L Block Lobby'
    },
    {
      src: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
      alt: 'HP Laptop Charger',
      location: 'SJT Room 302'
    },
    {
      src: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=600&auto=format&fit=crop',
      alt: 'Black Specs Case',
      location: 'TT Auditorium Entrance'
    },
    {
      src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop',
      alt: 'Lab Coat (Size M)',
      location: 'Chemistry Lab, MB Block'
    },
    {
      src: 'https://images.unsplash.com/photo-1627252874430-c114e99d8635?q=80&w=600&auto=format&fit=crop',
      alt: 'Leather Card Holder/ID Wallet',
      location: 'Main Gate Security Checkpoint'
    }
  ]

  const galleryImages = activeDbImages.length >= 5 ? activeDbImages : FALLBACK_GALLERY_IMAGES

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden', zIndex: 0 }}>
      {/* CSS Stylesheet Injector for advanced animations and responsive layouts */}
      <style dangerouslySetInnerHTML={{ __html: `
        .landing-wrapper::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("https://www.transparenttextures.com/patterns/cubes.png");
          background-repeat: repeat;
          opacity: 0.8;
          mix-blend-mode: multiply;
          z-index: -1;
          pointer-events: none;
        }
        .dark .landing-wrapper::before {
          filter: invert(1);
          opacity: 0.3;
          mix-blend-mode: screen;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(124, 58, 237, 0.4); }
          50% { box-shadow: 0 0 30px rgba(124, 58, 237, 0.8); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -40; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .bento-card {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bento-card:hover {
          transform: translateY(-8px) scale(1.01);
          border-color: var(--accent);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }
        .col-span-2 {
          grid-column: span 2;
        }
        /* Roadway styling */
        .roadway-container {
          position: relative;
          max-width: 800px;
          margin: 60px auto;
          padding: 20px 0;
        }
        .roadway-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, var(--accent) 0%, var(--found) 50%, var(--accent) 100%);
          transform: translateX(-50%);
          border-radius: 2px;
          z-index: 1;
        }
        .roadway-step {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 80px;
          width: 100%;
        }
        .roadway-step:nth-child(even) {
          flex-direction: row-reverse;
        }
        .roadway-card {
          width: 44%;
          z-index: 2;
          transition: all 0.3s ease;
        }
        .roadway-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent);
        }
        .roadway-dot {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--background);
          border: 4px solid var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          z-index: 3;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .roadway-step:hover .roadway-dot {
          background: var(--accent);
          color: white;
          transform: translateX(-50%) scale(1.2);
          box-shadow: var(--shadow-glow);
        }
        .roadway-step.destination .roadway-dot {
          border-color: var(--found);
          animation: pulse-glow 2s infinite;
        }
        .roadway-step.destination:hover .roadway-dot {
          background: var(--found);
        }
        .roadway-empty {
          width: 44%;
        }
        @media (max-width: 768px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
          .col-span-2 {
            grid-column: span 1;
          }
          .roadway-line {
            left: 30px;
          }
          .roadway-step {
            flex-direction: row !important;
            margin-bottom: 50px;
          }
          .roadway-card {
            width: calc(100% - 60px);
            margin-left: 60px;
          }
          .roadway-dot {
            left: 30px;
          }
          .roadway-empty {
            display: none;
          }
        }
      ` }} />

      {/* ── Nav ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          backgroundColor: 'color-mix(in srgb, var(--background) 80%, transparent)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 60,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background:
                  'conic-gradient(from 210deg, var(--accent), color-mix(in srgb, var(--found) 75%, var(--accent)))',
                boxShadow:
                  '0 0 0 2px color-mix(in srgb, var(--surface) 84%, transparent), 0 6px 14px color-mix(in srgb, var(--accent) 28%, transparent)',
              }}
            />
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Vault
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              href="/login"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn btn-primary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main style={{ flex: 1 }}>
        <section
          className="container"
          style={{
            paddingTop: 'clamp(64px, 8vw, 100px)',
            paddingBottom: 'clamp(48px, 6vw, 80px)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              borderRadius: 999,
              border: '1px solid var(--border)',
              backgroundColor: 'var(--accent-soft)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--accent)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 10 }}>●</span> VIT Vellore · Lost &amp; Found
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 6.5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
              maxWidth: 800,
              margin: '0 auto 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <BlurText
              text="To the students,"
              delay={150}
              animateBy="words"
              direction="top"
              as="span"
              animateImmediately={true}
            />
            <BlurText
              text="for the students."
              delay={150}
              animateBy="words"
              direction="bottom"
              as="span"
              initialDelay={450}
              animateImmediately={true}
              style={{
                background:
                  'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--found) 70%, var(--accent)) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
              }}
            />
          </h1>

          <BlurText
            text="Vault is VIT's custom lost & found network — designed to simplify finding what you lost, coordinate meetups securely, and earn trust."
            delay={50}
            animateBy="words"
            direction="bottom"
            as="p"
            initialDelay={900}
            animateImmediately={true}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'var(--text-secondary)',
              maxWidth: 520,
              margin: '0 auto 40px',
              lineHeight: 1.7,
              justifyContent: 'center',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 40,
            }}
          >
            <Link
              href="/register"
              className="btn btn-primary btn-lg"
              style={{ textDecoration: 'none' }}
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="btn btn-secondary btn-lg"
              style={{ textDecoration: 'none' }}
            >
              Sign In
            </Link>
          </div>

          {/* ── 3D Interactive Dome Gallery Section ── */}
          <div
            style={{
              height: '420px',
              width: '100%',
              position: 'relative',
              marginTop: 48,
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              background: 'radial-gradient(circle at center, color-mix(in srgb, var(--surface) 35%, transparent), transparent 70%)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <DomeGallery images={galleryImages} grayscale={false} />
            {/* Subtitle location hint overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                backgroundColor: 'rgba(24, 12, 46, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                color: '#b0bfd5',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3dd6ff' }} />
              <span>Drag to rotate · Click items to view campus locations</span>
            </div>
          </div>
        </section>

        {/* ── Visual Roadway Progress Section ── */}
        <section
          className="container"
          style={{
            paddingBottom: 'clamp(64px, 8vw, 100px)',
            position: 'relative',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <ScrollReveal
              as="h2"
              textAs="span"
              baseOpacity={0.15}
              baseRotation={1.5}
              blurStrength={3}
              stagger={0.03}
              containerClassName=""
              textClassName=""
              style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, display: 'block' }}
            >
              The Reunion Roadway
            </ScrollReveal>
            <ScrollReveal
              as="p"
              textAs="span"
              baseOpacity={0.25}
              baseRotation={0.5}
              blurStrength={2}
              stagger={0.01}
              containerClassName=""
              textClassName=""
              style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block' }}
            >
              Follow the journey of a lost item returning back to its rightful owner.
            </ScrollReveal>
          </div>

          <div className="roadway-container">
            <div className="roadway-line" />

            {/* Step 1: Report */}
            <div className="roadway-step">
              <div className="roadway-dot">1</div>
              <div className="surface panel roadway-card">
                <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>✍️</div>
                <ScrollReveal
                  as="h3"
                  textAs="span"
                  baseOpacity={0.2}
                  baseRotation={1}
                  blurStrength={2}
                  stagger={0.03}
                  style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6, display: 'block' }}
                >
                  1. Post & Ask
                </ScrollReveal>
                <ScrollReveal
                  as="p"
                  textAs="span"
                  baseOpacity={0.15}
                  baseRotation={1}
                  blurStrength={3}
                  stagger={0.02}
                  style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'block' }}
                >
                  The finder posts the item with a photo, location, and a secret question that only the real owner can answer correctly.
                </ScrollReveal>
              </div>
              <div className="roadway-empty" />
            </div>

            {/* Step 2: Claim */}
            <div className="roadway-step">
              <div className="roadway-dot">2</div>
              <div className="surface panel roadway-card">
                <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>🔑</div>
                <ScrollReveal
                  as="h3"
                  textAs="span"
                  baseOpacity={0.2}
                  baseRotation={1}
                  blurStrength={2}
                  stagger={0.03}
                  style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6, display: 'block' }}
                >
                  2. Answer & Claim
                </ScrollReveal>
                <ScrollReveal
                  as="p"
                  textAs="span"
                  baseOpacity={0.15}
                  baseRotation={1}
                  blurStrength={3}
                  stagger={0.02}
                  style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'block' }}
                >
                  The owner answers the secret question. If correct, they submit a short claim message. The finder reviews details and accepts the claim.
                </ScrollReveal>
              </div>
              <div className="roadway-empty" />
            </div>

            {/* Step 3: Meetup */}
            <div className="roadway-step">
              <div className="roadway-dot">3</div>
              <div className="surface panel roadway-card">
                <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>📍</div>
                <ScrollReveal
                  as="h3"
                  textAs="span"
                  baseOpacity={0.2}
                  baseRotation={1}
                  blurStrength={2}
                  stagger={0.03}
                  style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6, display: 'block' }}
                >
                  3. Coordinate Meetup
                </ScrollReveal>
                <ScrollReveal
                  as="p"
                  textAs="span"
                  baseOpacity={0.15}
                  baseRotation={1}
                  blurStrength={3}
                  stagger={0.02}
                  style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'block' }}
                >
                  A safe campus spot (SJT, Library, Cafeteria) and time are proposed, confirmed, and coordinates are shared in real-time.
                </ScrollReveal>
              </div>
              <div className="roadway-empty" />
            </div>

            {/* Step 4: Reunited */}
            <div className="roadway-step destination">
              <div className="roadway-dot" style={{ color: 'var(--found)' }}>✓</div>
              <div className="surface panel roadway-card" style={{ border: '2px solid var(--found)', boxShadow: '0 0 15px rgba(5, 150, 105, 0.15)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>🤝</div>
                <ScrollReveal
                  as="h3"
                  textAs="span"
                  baseOpacity={0.2}
                  baseRotation={1}
                  blurStrength={2}
                  stagger={0.03}
                  style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--found)', marginBottom: 6, display: 'block' }}
                >
                  Destination: Reunited!
                </ScrollReveal>
                <ScrollReveal
                  as="p"
                  textAs="span"
                  baseOpacity={0.15}
                  baseRotation={1}
                  blurStrength={3}
                  stagger={0.02}
                  style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'block' }}
                >
                  The owner gets the item back. Both rate the transaction to boost trust scores, finalizing the resolved status!
                </ScrollReveal>
              </div>
              <div className="roadway-empty" />
            </div>
          </div>
        </section>

        {/* ── Scroll Reveal Callout Section ── */}
        <section
          style={{
            paddingTop: '100px',
            paddingBottom: '100px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, var(--background-elevated) 0%, var(--background) 100%)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background glow */}
          <div
            style={{
              position: 'absolute',
              width: '600px',
              height: '400px',
              background: 'radial-gradient(circle at center, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
          <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '850px' }}>
            <ScrollReveal
              baseOpacity={0.06}
              baseRotation={3}
              blurStrength={6}
              textClassName="text-center text-primary font-bold"
              rotationEnd="center center"
              wordAnimationEnd="center center"
            >
              Lost it? Find it. Verified meetups. Real-time updates. Built exclusively for students at VIT Vellore.
            </ScrollReveal>
          </div>
        </section>

        {/* ── Interactive Bento Grid Section ── */}
        <section
          className="container"
          style={{
            paddingBottom: 'clamp(64px, 8vw, 100px)',
            borderTop: '1px solid var(--border)',
            paddingTop: 60,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Engineered For VITians
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              A premium, secure environment designed to get your belongings back fast.
            </p>
          </div>

          <div className="bento-grid">
            {/* Bento Card 1 - Large */}
            <div className="surface panel bento-card col-span-2" style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220 }}>
              <div>
                <span style={{ fontSize: '1.5rem' }}>🎓</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 12, marginBottom: 8 }}>VIT-Only Authentication</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '85%' }}>
                  Registration is locked down to verified <code>@vitstudent.ac.in</code> and <code>@vit.ac.in</code> emails. Keeping scammers and external users out.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
                <span className="badge badge-category">vitstudent.ac.in</span>
                <span className="badge badge-category">vit.ac.in</span>
              </div>
            </div>

            {/* Bento Card 2 - Small */}
            <div className="surface panel bento-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '1.5rem' }}>⭐</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 12, marginBottom: 8 }}>Trust Scores</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Peer rating keeps users accountable. High ratings show a history of successful, honest item returns.
                </p>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--found)' }}>★ 4.9 / 5.0</div>
            </div>

            {/* Bento Card 3 - Small */}
            <div className="surface panel bento-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '1.5rem' }}>🔒</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 12, marginBottom: 8 }}>Double Lock</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  A combination of custom cryptographic verification question and optional messaging before approval.
                </p>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--lost)', fontWeight: 600 }}>MAX 3 ATTEMPTS</div>
            </div>

            {/* Bento Card 4 - Large */}
            <div className="surface panel bento-card col-span-2" style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220 }}>
              <div>
                <span style={{ fontSize: '1.5rem' }}>⚡</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 12, marginBottom: 8 }}>Real-time Notifications</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '85%' }}>
                  Instantly get notified when someone answers your security question, claims your item, proposes a meetup, or accepts a plan.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--found)', display: 'inline-block' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connected to live messaging gateway</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          backgroundColor: 'color-mix(in srgb, var(--surface) 60%, transparent)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            © 2026 Vault. All copyrights reserved.
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Made with <span style={{ color: 'var(--lost)' }}>♥</span> by Lakshay
          </p>
        </div>
      </footer>
    </div>
  )
}
