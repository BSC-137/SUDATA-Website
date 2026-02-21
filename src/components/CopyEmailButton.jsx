import React, { useState } from 'react';

const CopyEmailButton = ({ email = 'sponsorships@sudata.org' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group relative px-6 py-2 border border-sudata-neon/40 text-sudata-grey font-mono-tech text-sm tracking-wider hover:border-sudata-neon hover:text-sudata-neon transition-all duration-300 flex items-center gap-2"
    >
      <span>{email}</span>
      <svg 
        className={`w-4 h-4 transition-all duration-300 ${copied ? 'text-sudata-neon scale-110' : 'text-sudata-grey group-hover:text-sudata-neon'}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        {copied ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        )}
      </svg>
      {copied && (
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-sudata-neon text-black px-3 py-1 text-xs font-mono-tech rounded whitespace-nowrap">
          Copied!
        </span>
      )}
    </button>
  );
};

export default CopyEmailButton;
