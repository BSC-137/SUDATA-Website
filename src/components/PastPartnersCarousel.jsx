import React, { useState, useEffect, useRef } from 'react';

const partners = [
  { name: 'Accenture',              logo: '/sponsors/past-partners/accenture.png' },
  { name: 'Amazon',                 logo: '/sponsors/past-partners/amazon.png' },
  { name: 'Aptent Digital',         logo: '/sponsors/past-partners/aptent.png' },
  { name: 'Canva',                  logo: '/sponsors/past-partners/canva.png' },
  { name: 'CBA',                    logo: '/sponsors/past-partners/cba.png' },
  { name: 'Comet CS',               logo: '/sponsors/past-partners/comet.png' },
  { name: 'Digital Health CRC',     logo: '/sponsors/past-partners/digital-health-crc.png' },
  { name: 'Dvuln',                  logo: '/sponsors/past-partners/dvuln.png' },
  { name: 'Gridware',               logo: '/sponsors/past-partners/gridware.png' },
  { name: 'Heidi Health',           logo: '/sponsors/past-partners/heidi.png' },
  { name: 'Lymbase',                logo: '/sponsors/past-partners/lymbase.png' },
  { name: 'Lyra',                   logo: '/sponsors/past-partners/lyra.png' },
  { name: 'Macquarie',              logo: '/sponsors/past-partners/macquarie.png' },
  { name: 'McGrathNicol',           logo: '/sponsors/past-partners/mcgrathnicol.png' },
  { name: 'Notion',                 logo: '/sponsors/past-partners/notion.png' },
  { name: 'NSW Ministry of Health', logo: '/sponsors/past-partners/nsw-health.png' },
  { name: 'Quantium',               logo: '/sponsors/past-partners/quantium.png' },
  { name: 'Rhombus AI',             logo: '/sponsors/past-partners/rhombus.png' },
  { name: 'Telstra',                logo: '/sponsors/past-partners/telstra.png' },
  { name: 'Tibra',                  logo: '/sponsors/past-partners/tibra.png' },
  { name: 'TikTok',                 logo: '/sponsors/past-partners/tiktok.png' },
  { name: 'Visagio',                logo: '/sponsors/past-partners/visagio.png' },
  { name: 'WayScape',               logo: '/sponsors/past-partners/wayscape.png' },
  { name: 'Woolworths Group',       logo: '/sponsors/past-partners/woolworths.png' },
];

const duplicated = [...partners, ...partners];

const PastPartnersCarousel = () => {
  const trackRef = useRef(null);
  const wrapperRef = useRef(null);
  const rafRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const pinnedRef = useRef(false);

  const [paused, setPaused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [logoWidth, setLogoWidth] = useState(160);
  const [gap, setGap] = useState(48);

  // Sync pausedRef with paused state
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Responsive logo sizing
  useEffect(() => {
    const updateSizes = () => {
      if (window.innerWidth < 640) {
        setLogoWidth(90);
        setGap(24);
      } else {
        setLogoWidth(160);
        setGap(48);
      }
    };
    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, []);

  // Animation loop
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

  // IntersectionObserver: reset pin when scrolled out of view
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            pinnedRef.current = false;
            setPinned(false);
            setPaused(false);
          }
        });
      },
      { threshold: 0 }
    );
    io.observe(wrapper);
    return () => io.disconnect();
  }, []);

  const handleItemClick = () => {
    pinnedRef.current = !pinnedRef.current;
    setPinned(pinnedRef.current);
    setPaused(pinnedRef.current);
  };

  const handleMouseEnter = () => {
    setPaused(true);
  };

  const handleMouseLeave = () => {
    if (!pinnedRef.current) {
      setPaused(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-0" ref={wrapperRef}>
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />

        <div
          ref={trackRef}
          className="flex items-center py-8"
          style={{ width: 'max-content', willChange: 'transform', gap: `${gap}px` }}
        >
          {duplicated.map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex-shrink-0 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              style={{ width: `${logoWidth}px`, height: '48px' }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleItemClick}
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
        {pinned ? 'Tap any logo to resume' : 'Hover to pause · tap to lock'}
      </p>
    </div>
  );
};

export default PastPartnersCarousel;
