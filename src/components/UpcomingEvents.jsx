import { useState, useEffect, useRef } from 'react';

// Category-specific pixel SVG icons — matching index.astro exactly
const ICONS = {
  ACADEMIC: (
    // Pixel Brain — same SVG as index.astro "The Hub" card
    <svg width="72" height="72" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 10px #00F0FF)' }}>
      <path fillRule="evenodd" clipRule="evenodd"
        d="M10 6H22V8H24V10H26V18H24V22H20V24H14V26H10V22H8V18H6V10H8V8H10V6ZM12 10H14V12H12V10ZM18 10H20V12H18V10ZM22 14H24V16H22V14ZM8 14H10V16H8V14ZM12 18H14V20H12V18ZM18 18H20V20H18V18Z"
        fill="#00F0FF"/>
    </svg>
  ),
  SOCIAL: (
    // Pixel Users — same SVG as index.astro "The Collective" card
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 10px #a78bfa)' }}>
      <path
        d="M11 0H5v2H3v6h2v2h6V8H5V2h6V0zm0 2h2v6h-2V2zM0 14h2v4h12v2H0v-6zm2 0h12v-2H2v2zm14 0h-2v6h2v-6zM15 0h4v2h-4V0zm4 8h-4v2h4V8zm0-6h2v6h-2V2zm5 12h-2v4h-4v2h6v-6zm-6-2h4v2h-4v-2z"
        fill="#a78bfa"/>
    </svg>
  ),
};

const CATEGORY_CONFIG = {
  ACADEMIC: { color: '#00F0FF', label: 'ACADEMIC' },
  SOCIAL:   { color: '#a78bfa', label: 'SOCIAL' },
};

// EventCalendar uses event.type ("social"/"academic").
// Support both event.type and event.category as fallback.
function resolveCategory(ev) {
  const raw = ev.type || ev.category || 'academic';
  return raw.toUpperCase();
}

function getConfig(ev) {
  const key = resolveCategory(ev);
  return CATEGORY_CONFIG[key] || CATEGORY_CONFIG['ACADEMIC'];
}

function getIcon(ev) {
  const key = resolveCategory(ev);
  return ICONS[key] || ICONS.ACADEMIC;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1] ? parts[1].padStart(2, '0') : '00';
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m} ${period}`;
}

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const evDate = new Date(dateStr);
  evDate.setHours(0, 0, 0, 0);
  return Math.round((evDate - today) / (1000 * 60 * 60 * 24));
}

function EventCard({ ev, index }) {
  const days = daysUntil(ev.date);
  const dayLabel = days === 0 ? 'TODAY' : days === 1 ? 'TOMORROW' : `IN ${days} DAYS`;
  const cfg = getConfig(ev);
  const icon = getIcon(ev);
  const hasLink = ev.registrationLink || ev.link;
  const paddedIndex = String(index + 1).padStart(2, '0');

  // glass-panel-3d has overflow:hidden which clips the glow box-shadow on hover.
  // Wrapping in a padded div gives the shadow room — negative margin keeps layout tight.
  const cardInner = (
    <div style={{ padding: '8px', margin: '-8px', flexShrink: 0 }}>
      <div
        className="group glass-panel-3d scanline-overlay flex flex-col items-start text-left relative"
        style={{ width: '240px', minWidth: '240px', minHeight: '360px', padding: '28px 20px' }}
      >
        {/* Top block: category label on line 1, urgency badge on line 2 */}
        <div className="relative z-10 flex flex-col gap-2 w-full mb-5">
          <span
            className="font-mono-tech text-xs tracking-[0.15em] opacity-80 whitespace-nowrap"
            style={{ color: cfg.color }}
          >
            [ {paddedIndex}_{cfg.label} ]
          </span>
          <span
            className="font-mono-tech text-[10px] tracking-[0.12em] px-2 py-0.5 whitespace-nowrap self-start"
            style={{
              color: cfg.color,
              border: `1px solid ${cfg.color}55`,
              background: `${cfg.color}15`,
            }}
          >
            {dayLabel}
          </span>
        </div>

        {/* Icon — bracket style matching index.astro, category-aware */}
        <div className="relative z-10 flex justify-center items-center w-full mb-5 neon-icon-glow">
          <span className="font-mono text-white/40 text-6xl leading-none mr-2">[</span>
          {icon}
          <span className="font-mono text-white/40 text-6xl leading-none ml-2">]</span>
        </div>

        {/* Title — turns cyan on card hover */}
        <h3
          className="relative z-10 font-mono-tech font-bold text-sm text-white tracking-widest mb-3 transition-colors group-hover:text-sudata-neon leading-snug"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {ev.title || ev.name}
        </h3>

        {/* Meta */}
        <div className="relative z-10 font-mono-tech text-[11px] text-sudata-grey leading-7 mb-4 flex-1">
          <div>◈ {formatDate(ev.date)}</div>
          {ev.time && (
            <div>◷ {formatTime(ev.time)}{ev.endTime ? ` – ${formatTime(ev.endTime)}` : ''}</div>
          )}
          {ev.location && (
            <div className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full">◎ {ev.location}</div>
          )}
        </div>

        {/* CTA */}
        <div
          className="relative z-10 font-mono-tech text-[11px] tracking-[0.15em] flex items-center gap-1 mt-auto"
          style={{ color: hasLink ? cfg.color : 'rgba(255,255,255,0.25)' }}
        >
          <span>{hasLink ? 'SIGN UP' : 'SIGN UP COMING SOON'}</span>
          {hasLink && (
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          )}
        </div>
      </div>
    </div>
  );

  if (hasLink) {
    return (
      <a href={hasLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flexShrink: 0 }}>
        {cardInner}
      </a>
    );
  }

  return <div style={{ flexShrink: 0 }}>{cardInner}</div>;
}

export default function UpcomingEvents({ events = [] }) {
  const [upcoming, setUpcoming] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + 14);

    const filtered = (events || [])
      .filter(ev => {
        const d = new Date(ev.date);
        return d >= today && d <= cutoff;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setUpcoming(filtered);
  }, [events]);

  if (upcoming.length === 0) return null;

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ marginBottom: '32px' }}>

      {/* Header — terminal block style */}
      <div
        className="terminal-block scanline-overlay"
        style={{ padding: '24px 20px 20px 20px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
      >
        <div className="relative z-10">
          <div className="font-mono-tech text-sudata-neon/80 text-sm tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="animate-flicker">&gt;_</span>
            <span>[SECTION: UPCOMING_EVENTS]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="text-xl font-bold text-white font-mono-tech tracking-widest">
                Next 14 Days
              </h2>
              <p className="text-sudata-grey font-mono-tech text-sm mt-1">
                {upcoming.length} event{upcoming.length !== 1 ? 's' : ''} incoming — click a card to register
              </p>
            </div>
            {upcoming.length > 2 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => scroll(-1)}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-sudata-neon/40 text-sudata-neon font-mono-tech hover:bg-sudata-neon/10 active:bg-sudata-neon/20 transition-colors text-lg sm:text-xl touch-manipulation"
                  aria-label="Scroll left"
                >‹</button>
                <button
                  onClick={() => scroll(1)}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-sudata-neon/40 text-sudata-neon font-mono-tech hover:bg-sudata-neon/10 active:bg-sudata-neon/20 transition-colors text-lg sm:text-xl touch-manipulation"
                  aria-label="Scroll right"
                >›</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card scroll row — extra top padding so glow shadow is never clipped */}
      <div
        ref={scrollRef}
        className="touch-pan-x"
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          overflowY: 'visible',
          padding: '16px 20px 24px 20px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#00F0FF33 transparent',
          background: 'rgba(0,240,255,0.02)',
          border: '1px solid rgba(0,240,255,0.4)',
          borderTop: 'none',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {upcoming.map((ev, i) => (
          <EventCard key={ev.id || i} ev={ev} index={i} />
        ))}
      </div>
    </div>
  );
}
