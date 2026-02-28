import { useState, useEffect, useRef } from 'react';

// Recruitment closes 13 Mar — auto-hide everything from 14 Mar onwards
const DEADLINE = new Date('2026-03-14T00:00:00');
const APPLY_LINK = 'https://forms.gle/1MQWKQtUChUzeNfS6';

export default function SubcomRecruitment({ isHomePage }) {
  // Start expired=true so nothing flashes before the effect runs
  const [expired, setExpired] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [widgetVisible, setWidgetVisible] = useState(false);

  const widgetRef = useRef(null);
  const dragState = useRef({
    isDragging: false,
    hasMoved: false,
    startX: 0, startY: 0,
    startLeft: 0, startTop: 0,
  });

  // ── Deadline + popup trigger ──────────────────────────────────────────────
  useEffect(() => {
    if (new Date() >= DEADLINE) return; // stay expired, render nothing

    setExpired(false);
    setWidgetVisible(true);

    if (!isHomePage) return;

    // Don't re-show popup if already shown (marked on first trigger)
    if (localStorage.getItem('subcom_popup_seen')) return;

    let triggered = false;
    let io;

    const trigger = () => {
      if (triggered) return;
      triggered = true;
      // Mark immediately — never re-shows regardless of how the user leaves
      localStorage.setItem('subcom_popup_seen', 'true');
      setPopupOpen(true);
      io?.disconnect();
      clearTimeout(timer);
    };

    // Primary trigger: when stats/CTA section scrolls into view
    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      io = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting) trigger(); },
        { threshold: 0.3 }
      );
      io.observe(statsSection);
    }

    // Fallback trigger: 8 seconds on page
    const timer = setTimeout(trigger, 8000);

    return () => { io?.disconnect(); clearTimeout(timer); };
  }, [isHomePage]);

  // ── Escape key closes popup ───────────────────────────────────────────────
  useEffect(() => {
    if (!popupOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [popupOpen]);

  // ── Body scroll lock when popup open ─────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = popupOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [popupOpen]);

  // ── Drag move / release listeners (global, attached once) ────────────────
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragState.current.isDragging) return;
      const widget = widgetRef.current;
      if (!widget) return;

      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.current.hasMoved = true;

      applyPosition(widget, dragState.current.startLeft + dx, dragState.current.startTop + dy);
    };

    const onMouseUp = () => {
      if (!dragState.current.isDragging) return;
      dragState.current.isDragging = false;
      if (widgetRef.current) widgetRef.current.style.cursor = 'grab';
    };

    const onTouchMove = (e) => {
      if (!dragState.current.isDragging) return;
      const touch = e.touches[0];
      const widget = widgetRef.current;
      if (!widget) return;

      const dx = touch.clientX - dragState.current.startX;
      const dy = touch.clientY - dragState.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragState.current.hasMoved = true;
        e.preventDefault(); // only prevent scroll when actually moving
      }

      applyPosition(widget, dragState.current.startLeft + dx, dragState.current.startTop + dy);
    };

    const onTouchEnd = () => { dragState.current.isDragging = false; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // Clamp widget inside viewport with 8px padding
  const applyPosition = (widget, left, top) => {
    const maxLeft = window.innerWidth - widget.offsetWidth - 8;
    const maxTop = window.innerHeight - widget.offsetHeight - 8;
    widget.style.left = Math.max(8, Math.min(left, maxLeft)) + 'px';
    widget.style.top = Math.max(8, Math.min(top, maxTop)) + 'px';
  };

  // Called on mousedown / touchstart to begin a drag
  const startDrag = (clientX, clientY) => {
    const widget = widgetRef.current;
    if (!widget) return;

    const rect = widget.getBoundingClientRect();

    // Switch from CSS bottom/right to explicit left/top so we can move freely
    widget.style.left = rect.left + 'px';
    widget.style.top = rect.top + 'px';
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
    widget.style.cursor = 'grabbing';

    dragState.current = {
      isDragging: true,
      hasMoved: false,
      startX: clientX,
      startY: clientY,
      startLeft: rect.left,
      startTop: rect.top,
    };
  };

  const dismiss = () => {
    setPopupOpen(false);
  };

  if (expired) return null;

  return (
    <>
      {/* ── Popup ──────────────────────────────────────────────────────────── */}
      {popupOpen && (
        <div
          className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={dismiss}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md bg-[#020617] rounded-t-2xl sm:rounded-2xl border-2 border-[#00F0FF]/40 p-5 sm:p-8 overflow-y-auto"
            style={{
              boxShadow: '0 0 60px rgba(0,240,255,0.3), inset 0 0 40px rgba(0,240,255,0.05)',
              maxHeight: '90dvh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-20" />

            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20 active:bg-[#00F0FF]/30 transition-all duration-200 touch-manipulation"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ imageRendering: 'pixelated' }}>
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
              </svg>
            </button>

            {/* Label tag */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#00F0FF]/10 border border-[#00F0FF]/30 mb-4">
              <span className="font-mono text-[#00F0FF] text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase animate-flicker">
                [ NOW_RECRUITING ]
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-3xl font-bold text-[#00F0FF] mb-2 sm:mb-3 neon-text-shadow">
              Join the SUDATA Team
            </h2>

            {/* Body */}
            <p className="font-mono text-[#94a3b8] text-sm leading-relaxed mb-4">
              We're recruiting subcommittee members for 2026. Help us shape events, grow our community, and make an impact in the data space at USYD.
            </p>

            {/* Deadline */}
            <div className="flex items-center gap-2 mb-5 font-mono text-xs text-[#94a3b8]/60 tracking-wider uppercase">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#00F0FF" style={{ imageRendering: 'pixelated', opacity: 0.6 }}>
                <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" />
              </svg>
              Closes 13 March 2026
            </div>

            {/* Apply button — min-h-[44px] ensures tappable on mobile */}
            <a
              href={APPLY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full min-h-[44px] px-6 text-center font-mono font-bold text-[#020617] bg-[#00F0FF] hover:bg-[#70FFFF] rounded-xl transition-all duration-300 active:scale-[0.98] text-sm sm:text-base touch-manipulation"
              style={{ boxShadow: '0 0 30px rgba(0,240,255,0.5)' }}
              onClick={dismiss}
            >
              Apply Now →
            </a>

            <p className="text-center text-[10px] font-mono text-[#94a3b8]/30 mt-3">
              tap outside to dismiss
            </p>
          </div>
        </div>
      )}

      {/* ── Draggable floating widget (all pages) ────────────────────────── */}
      {widgetVisible && !popupOpen && (
        <div
          ref={widgetRef}
          className="fixed right-4 sm:right-6 z-[62] select-none touch-none"
          style={{
            cursor: 'grab',
            // Sit above iOS Safari browser chrome using safe-area-inset
            bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          }}
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
          }}
        >
          <a
            href={APPLY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 bg-[#020617] border border-[#00F0FF]/50 hover:border-[#00F0FF] rounded-xl font-mono text-[#00F0FF] text-xs font-bold transition-colors duration-300 hover:bg-[#00F0FF]/10 touch-manipulation"
            style={{
              boxShadow: '0 0 16px rgba(0,240,255,0.2)',
              cursor: 'inherit',
              // 44px min height for iOS tap target compliance
              minHeight: '44px',
            }}
            aria-label="Apply for SUDATA subcommittee"
            draggable={false}
            onClick={(e) => {
              // Cancel navigation if the widget was dragged rather than tapped
              if (dragState.current.hasMoved) e.preventDefault();
            }}
          >
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
              className="animate-pulse shrink-0"
              style={{ imageRendering: 'pixelated' }}
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            JOIN SUBCOM
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="currentColor"
              className="group-hover:translate-x-0.5 transition-transform shrink-0"
              style={{ imageRendering: 'pixelated' }}
            >
              <path d="M10 17l5-5-5-5v10z" />
            </svg>
          </a>
        </div>
      )}
    </>
  );
}
