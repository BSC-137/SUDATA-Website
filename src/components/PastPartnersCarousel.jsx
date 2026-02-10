import React, { useState, useEffect, useRef } from 'react';

const PastPartnersCarousel = () => {
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef(null);
  const animationRef = useRef(null);

  // List of past partners (duplicated for seamless loop)
  const partners = [
    'Canva', 'Amazon', 'TikTok', 'Aptent Digital', 'Digital Health CRC',
    'Lymbase', 'Rhombus AI', 'Woolworths Group', 'Telstra', 'NSW Ministry of Health',
    'Accenture', 'Tibra', 'Quantium', 'Westpac', 'Macquarie',
    'CBA', 'Visagio', 'McGrathNicol', 'Comet CS', 'Notion',
    'Lyra', 'WayScape', 'Heidi Health', 'Gridware Cybersecurity', 'Dvuln', 'Talentsheet'
  ];

  // Duplicate partners array for seamless scrolling
  const duplicatedPartners = [...partners, ...partners];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollPosition = 0;
    const maxScroll = container.scrollWidth / 2;

    const scroll = () => {
      if (!isPaused) {
        scrollPosition += scrollSpeed;
        
        // Reset to beginning when we've scrolled through first set
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        
        container.scrollLeft = scrollPosition;
      }
      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scrollSpeed, isPaused]);

  const handleSpeedChange = (newSpeed) => {
    setScrollSpeed(newSpeed);
  };

  return (
    <div className="w-full">
      {/* Speed Controls */}
      <div className="flex justify-center items-center gap-4 mb-8">
        <span className="text-sudata-grey font-mono-tech text-xs tracking-wider">SCROLL SPEED:</span>
        <div className="flex gap-2">
          {[0.5, 1, 2, 3].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`px-3 py-1 font-mono-tech text-xs border transition-all duration-200 ${
                scrollSpeed === speed
                  ? 'border-sudata-neon bg-sudata-neon/20 text-sudata-neon'
                  : 'border-sudata-grey/30 text-sudata-grey hover:border-sudata-neon/50 hover:text-white'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`px-4 py-1 font-mono-tech text-xs border transition-all duration-200 ${
            isPaused
              ? 'border-sudata-neon bg-sudata-neon/20 text-sudata-neon'
              : 'border-sudata-grey/30 text-sudata-grey hover:border-sudata-neon/50 hover:text-white'
          }`}
        >
          {isPaused ? 'RESUME' : 'PAUSE'}
        </button>
      </div>

      {/* Scrolling Container */}
      <div className="relative overflow-hidden">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-hidden py-8"
          style={{ scrollBehavior: 'auto' }}
        >
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner}-${index}`}
              className="flex-shrink-0 px-8 py-4 border border-sudata-neon/20 bg-black/40 hover:border-sudata-neon hover:bg-black/60 transition-all duration-300 group cursor-default"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <span className="text-white font-mono-tech text-lg tracking-wider whitespace-nowrap group-hover:text-sudata-neon transition-colors duration-300">
                {partner}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-sudata-grey font-mono-tech text-xs mt-6 tracking-wide">
        Hover to pause • Adjust speed to explore
      </p>
    </div>
  );
};

export default PastPartnersCarousel;
