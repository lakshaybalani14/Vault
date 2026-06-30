'use client';

import dynamic from 'next/dynamic';

const ScrollReveal = dynamic(() => import('./ScrollReveal'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '20px 0', opacity: 0.15, textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      Loading scroll reveal...
    </div>
  )
});

export default ScrollReveal;
