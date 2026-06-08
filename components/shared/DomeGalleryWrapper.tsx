'use client';

import dynamic from 'next/dynamic';

const DomeGallery = dynamic(() => import('./DomeGallery'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      Loading Interactive Board...
    </div>
  )
});

export default DomeGallery;
