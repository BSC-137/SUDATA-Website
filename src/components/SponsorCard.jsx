import React, { useState } from 'react';

const SponsorCard = ({ name, tier, url, description, logoWhite, logoColor }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative border-2 border-sudata-neon/30 bg-black/40 p-6 transition-all duration-300 hover:border-sudata-neon hover:bg-black/60 hover:shadow-[0_0_20px_rgba(0,255,157,0.3)]">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            {logoWhite && logoColor ? (
              <div className="mb-3 relative h-12 md:h-16">
                <img 
                  src={logoWhite} 
                  alt={`${name} logo`}
                  className="absolute top-0 left-0 h-12 md:h-16 w-auto object-contain transition-opacity duration-300"
                  style={{ opacity: isHovered ? 0 : 0.9 }}
                />
                <img 
                  src={logoColor} 
                  alt={`${name} logo color`}
                  className="absolute top-0 left-0 h-12 md:h-16 w-auto object-contain transition-opacity duration-300"
                  style={{ opacity: isHovered ? 1 : 0 }}
                />
              </div>
            ) : (
              <h3 className="text-2xl font-bold text-white font-mono-tech tracking-wider group-hover:text-sudata-neon transition-colors duration-300">
                {name}
              </h3>
            )}
            <div className="mt-2 inline-block px-3 py-1 border border-sudata-neon/50 text-sudata-neon font-mono-tech text-xs tracking-widest">
              {tier.toUpperCase()}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sudata-grey group-hover:text-sudata-neon transition-colors duration-300">
            <span className="font-mono-tech text-sm">VISIT SITE</span>
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
        <p className="text-sudata-grey font-mono-tech text-sm md:text-base leading-relaxed">
          {description}
        </p>
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-sudata-neon/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </a>
  );
};

export default SponsorCard;
