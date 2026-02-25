import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

/**
 * PDFMobileFlipbook — page-by-page PDF viewer for mobile.
 * Renders each page onto a <canvas> scaled to fit the container width.
 *
 * Props:
 *   pdfSrc — public path to the PDF
 */
export default function PDFMobileFlipbook({ pdfSrc }) {
  const canvasRef      = useRef(null);
  const containerRef   = useRef(null);
  const renderTaskRef  = useRef(null);
  const [pdfDoc,    setPdfDoc]    = useState(null);
  const [pageNum,   setPageNum]   = useState(1);
  const [numPages,  setNumPages]  = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);

  // Load the PDF document once
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    pdfjsLib.getDocument(pdfSrc).promise
      .then(doc => {
        if (cancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum(1);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [pdfSrc]);

  // Render the current page whenever pdfDoc or pageNum changes
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    let cancelled = false;

    const render = async () => {
      // Cancel any in-flight render
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch (_) {}
        renderTaskRef.current = null;
      }

      try {
        const page         = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const canvas       = canvasRef.current;
        const container    = containerRef.current;
        if (!canvas || !container) return;

        const containerW   = container.clientWidth || 300;
        const baseViewport = page.getViewport({ scale: 1 });

        // Multiply by devicePixelRatio so the canvas is drawn at full physical
        // resolution — without this, the browser upscales the canvas on Retina /
        // high-DPR screens and the text looks blurry.
        const dpr          = window.devicePixelRatio || 1;
        const scale        = (containerW / baseViewport.width) * dpr;
        const viewport     = page.getViewport({ scale });

        // Canvas backing store = physical pixels
        canvas.width  = viewport.width;
        canvas.height = viewport.height;

        // CSS size = logical (CSS) pixels so it fills the container correctly
        canvas.style.width  = `${containerW}px`;
        canvas.style.height = `${Math.round(viewport.height / dpr)}px`;

        const task = page.render({
          canvasContext: canvas.getContext('2d'),
          viewport,
        });
        renderTaskRef.current = task;

        await task.promise;
        renderTaskRef.current = null;
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('PDF render error:', err);
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum]);

  const goBack = () => setPageNum(p => Math.max(1, p - 1));
  const goFwd  = () => setPageNum(p => Math.min(numPages, p + 1));

  return (
    <div className="w-full flex flex-col items-center gap-4">

      {/* Canvas wrapper */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-[#0a0f1e]"
        style={{
          boxShadow: '0 0 0 1px rgba(0,240,255,0.25), 8px 8px 0 rgba(0,240,255,0.07), -8px 8px 0 rgba(0,240,255,0.07)',
        }}
      >
        {loading && (
          <div className="flex items-center justify-center py-16 font-mono-tech text-sudata-neon/50 text-xs tracking-widest">
            LOADING PDF...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16 font-mono-tech text-sudata-grey/50 text-xs tracking-widest">
            UNABLE TO LOAD PDF
          </div>
        )}
        <canvas ref={canvasRef} className="block" />
      </div>

      {/* Page navigation */}
      {!loading && !error && numPages > 0 && (
        <div className="flex items-center gap-3 font-mono-tech text-xs tracking-wider select-none">
          <button
            onClick={goBack}
            disabled={pageNum <= 1}
            className="px-4 py-2 border border-sudata-neon/40 text-sudata-neon/80 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-sudata-neon/10 transition-colors"
          >
            ← PREV
          </button>
          <span className="text-sudata-grey/60 tabular-nums w-16 text-center">
            {pageNum} / {numPages}
          </span>
          <button
            onClick={goFwd}
            disabled={pageNum >= numPages}
            className="px-4 py-2 border border-sudata-neon/40 text-sudata-neon/80 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-sudata-neon/10 transition-colors"
          >
            NEXT →
          </button>
        </div>
      )}

    </div>
  );
}
