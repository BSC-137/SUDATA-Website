import React, { useState, useEffect, useRef } from 'react';

const partners = [
  { name: 'Accenture',              logo: 'public/sponsors/past-partners/accenture.png' },
  { name: 'Amazon',                 logo: 'public/sponsors/past-partners/amazon.png' },
  { name: 'Aptent Digital',         logo: 'public/sponsors/past-partners/aptent.png' },
  { name: 'Canva',                  logo: 'public/sponsors/past-partners/canva.png' },
  { name: 'CBA',                    logo: 'public/sponsors/past-partners/cba.png' },
  { name: 'Comet CS',               logo: 'public/sponsors/past-partners/comet.png' },
  { name: 'Digital Health CRC',     logo: 'public/sponsors/past-partners/digital-health-crc.png' },
  { name: 'Dvuln',                  logo: 'public/sponsors/past-partners/dvuln.png' },
  { name: 'Gridware',               logo: 'public/sponsors/past-partners/gridware.png' },
  { name: 'Heidi Health',           logo: 'public/sponsors/past-partners/heidi.png' },
  { name: 'Lymbase',                logo: 'public/sponsors/past-partners/lymbase.png' },
  { name: 'Lyra',                   logo: 'public/sponsors/past-partners/lyra.png' },
  { name: 'Macquarie',              logo: 'public/sponsors/past-partners/macquarie.png' },
  { name: 'McGrathNicol',           logo: 'public/sponsors/past-partners/mcgrathnicol.png' },
  { name: 'Notion',                 logo: 'public/sponsors/past-partners/notion.png' },
  { name: 'NSW Ministry of Health', logo: 'public/sponsors/past-partners/nsw-health.png' },
  { name: 'Quantium',               logo: 'public/sponsors/past-partners/quantium.png' },
  { name: 'Rhombus AI',             logo: 'public/sponsors/past-partners/rhombus.png' },
  { name: 'Telstra',                logo: 'public/sponsors/past-partners/telstra.png' },
  { name: 'Tibra',                  logo: 'public/sponsors/past-partners/tibra.png' },
  { name: 'TikTok',                 logo: 'public/sponsors/past-partners/tiktok.png' },
  { name: 'Visagio',                logo: 'public/sponsors/past-partners/visagio.png' },
  { name: 'WayScape',               logo: 'public/sponsors/past-partners/wayscape.png' },
  { name: 'Woolworths Group',       logo: 'public/sponsors/past-partners/woolworths.png' },
];

const duplicated = [...partners, ...partners];

const LOGO_WIDTH = 160;
const GAP = 48;

const PastPartnersCarousel = () => {
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const speed = 0.5;

    const tick = () => {
      if (!pausedRef.current) {
        posRef.current += speed;
        const half = track.scrollWidth / 2;
        if (posRef.current >= half) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="w-full">
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />

        <div
          ref={trackRef}
          className="flex items-center py-8"
          style={{ width: 'max-content', willChange: 'transform', gap: `${GAP}px` }}
        >
          {duplicated.map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex-shrink-0 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default"
              style={{ width: `${LOGO_WIDTH}px`, height: '48px' }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-sudata-grey font-mono-tech text-xs mt-6 tracking-wide opacity-50">
        Hover to pause
      </p>
    </div>
  );
};

export default PastPartnersCarousel;
