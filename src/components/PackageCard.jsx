import React, { useState } from 'react';

const PackageCard = ({ name, price, tagline, highlights }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative border-2 border-sudata-neon/30 bg-black/40 p-6 transition-all duration-300 hover:border-sudata-neon hover:bg-black/60 hover:shadow-[0_0_30px_rgba(0,255,157,0.2)] flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xl font-bold text-white font-mono-tech tracking-wider">
            {name}
          </h3>
          <span className="text-2xl font-bold text-sudata-neon font-mono-tech">
            {price}
          </span>
        </div>
        <p className="text-sudata-grey font-mono-tech text-sm tracking-wide italic">
          {tagline}
        </p>
      </div>

      {/* Divider */}
      <div className={`h-px bg-gradient-to-r from-transparent via-sudata-neon to-transparent mb-6 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-50'}`} />

      {/* Highlights */}
      <ul className="space-y-3 flex-grow">
        {highlights.map((highlight, index) => (
          <li 
            key={index} 
            className="flex items-start gap-3 font-mono-tech text-sm text-sudata-grey group/item"
          >
            <span className="text-sudata-neon mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover/item:scale-110">
              ▹
            </span>
            <span className="leading-relaxed group-hover/item:text-white transition-colors duration-200">
              {highlight}
            </span>
          </li>
        ))}
      </ul>

      {/* Animated corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-sudata-neon transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} />
      <div className={`absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-sudata-neon transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} />
    </div>
  );
};

export default PackageCard;
