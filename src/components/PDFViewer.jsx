import { useState, useEffect, lazy, Suspense } from 'react';

/**
 * Lazily import the flipbook — this is a dynamic import so pdfjs-dist is
 * never evaluated during Astro's Node.js SSR phase (only in the browser).
 */
const PDFMobileFlipbook = lazy(() => import('./PDFMobileFlipbook.jsx'));

/**
 * PDFViewer — shows a page-by-page flipbook on mobile and an inline iframe on
 * desktop, with a download button below on both.
 *
 * Props:
 *   pdfSrc           — public path to the PDF, e.g. "/First%20Year%20Guide%20(Booklets).pdf"
 *   downloadFilename — suggested filename for the download
 */
export default function PDFViewer({ pdfSrc, downloadFilename }) {
  // Detect mobile after hydration — null means "not yet determined"
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-6">

      {/* Viewer — flipbook on mobile, iframe on desktop.
          During SSR isMobile is null so nothing renders (avoids Node.js issues). */}
      {isMobile === null ? null : isMobile ? (
        <Suspense fallback={
          <div
            className="relative w-full overflow-hidden bg-[#0a0f1e] flex items-center justify-center py-16"
            style={{ boxShadow: '0 0 0 1px rgba(0,240,255,0.25)' }}
          >
            <span className="font-mono-tech text-sudata-neon/50 text-xs tracking-widest">LOADING PDF...</span>
          </div>
        }>
          <PDFMobileFlipbook pdfSrc={pdfSrc} />
        </Suspense>
      ) : (
        <div
          className="relative w-full overflow-hidden bg-[#0a0f1e]"
          style={{
            boxShadow: '0 0 0 1px rgba(0,240,255,0.25), 8px 8px 0 rgba(0,240,255,0.07), -8px 8px 0 rgba(0,240,255,0.07)',
            height: 'clamp(320px, 55vw, 580px)',
          }}
        >
          <iframe
            src={pdfSrc}
            title="First Year Guide"
            className="w-full h-full border-0"
          />
        </div>
      )}

      {/* Download button */}
      <a
        href={pdfSrc}
        download={downloadFilename}
        className="group relative px-6 py-2.5 sm:px-8 sm:py-3 bg-transparent border-2 border-sudata-neon text-sudata-neon font-mono-tech tracking-wider text-xs sm:text-sm hover:bg-sudata-neon/10 transition-all duration-300 flex items-center gap-2"
      >
        <span>DOWNLOAD GUIDE</span>
        <svg
          className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
      </a>

    </div>
  );
}
