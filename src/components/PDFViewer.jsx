/**
 * PDFViewer — renders a PDF inline via an iframe styled to the SUDATA dark theme,
 * with a download button below.
 *
 * The iframe is shown immediately so the browser's native PDF viewer can display
 * its own loading progress — no blocking overlay that waits for full render.
 *
 * Props:
 *   pdfSrc           — public path to the PDF, e.g. "/First%20Year%20Guide%20(Booklets).pdf"
 *   downloadFilename — suggested filename for the download, e.g. "SUDATA-First-Year-Guide.pdf"
 */
export default function PDFViewer({ pdfSrc, downloadFilename }) {
  return (
    <div className="w-full flex flex-col items-center gap-6">

      {/* Viewer wrapper */}
      <div
        className="relative w-full overflow-hidden bg-[#0a0f1e]"
        style={{
          boxShadow: '0 0 0 1px rgba(0,240,255,0.25), 8px 8px 0 rgba(0,240,255,0.07), -8px 8px 0 rgba(0,240,255,0.07)',
          /* min 320px on phone → grows with viewport → caps at 580px on large screens */
          height: 'clamp(320px, 55vw, 580px)',
        }}
      >
        <iframe
          src={pdfSrc}
          title="First Year Guide"
          className="w-full h-full border-0"
        />
      </div>

      {/* Download button — matches the "DOWNLOAD PROSPECTUS" style on the sponsors page */}
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
