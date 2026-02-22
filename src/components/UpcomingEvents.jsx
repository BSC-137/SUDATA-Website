import { useState, useEffect, useRef } from 'react';

const ICONS = {
  ACADEMIC: (
    <svg width="72" height="72" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 10px #00F0FF)' }}>
      <path fillRule="evenodd" clipRule="evenodd"
        d="M10 6H22V8H24V10H26V18H24V22H20V24H14V26H10V22H8V18H6V10H8V8H10V6ZM12 10H14V12H12V10ZM18 10H20V12H18V10ZM22 14H24V16H22V14ZM8 14H10V16H8V14ZM12 18H14V20H12V18ZM18 18H20V20H18V18Z"
        fill="#00F0FF"/>
    </svg>
  ),
  SOCIAL: (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 10px #a78bfa)' }}>
      <path
        d="M11 0H5v2H3v6h2v2h6V8H5V2h6V0zm0 2h2v6h-2V2zM0 14h2v4h12v2H0v-6zm2 0h12v-2H2v2zm14 0h-2v6h2v-6zM15 0h4v2h-4V0zm4 8h-4v2h4V8zm0-6h2v6h-2V2zm5 12h-2v4h-4v2h6v-6zm-6-2h4v2h-4v-2z"
        fill="#a78bfa"/>
    </svg>
  ),
  DEFAULT: (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 10px #00F0FF)' }}>
      <path
        d="M12 1h2v8h8v4h-2v-2h-8V5h-2V3h2V1zM8 7V5h2v2H8zM6 9V7h2v2H6zm-2 2V9h2v2H4zm10 8v2h-2v2h-2v-8H2v-4h2v2h8v6h2zm2-2v2h-2v-2h2zm2-2v2h-2v-2h2zm0 0h2v-2h-2v2z"
        fill="#00F0FF"/>
    </svg>
  ),
};

const CATEGORY_CONFIG = {
  ACADEMIC: { color: '#00F0FF' },
  SOCIAL:   { color: '#a78bfa' },
};

function getConfig(category) {
  return CATEGORY_CONFIG[category?.toUpperCase()] || CATEGORY_CONFIG['ACADEMIC'];
}

function getIcon(category) {
  return ICONS[category?.toUpperCase()] || ICONS.DEFAULT;
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

// Card styling mirrors index.astro glass-panel-3d exactly via inline styles
// so it is never dependent on a CSS class that might get clipped
const cardStyle = {
  width: '260px',
  minWidth: '260px',
  minHeight: '390px',
  height: '390px',
  background: 'linear-gradient(135deg, rgba(0,240,255,0.04) 0%, rgba(2,6,23,0.95) 60%)',
  border: '1px solid rgba(0,240,255,0.25)',
  borderRadius: '16px',
  boxShadow: '0 0 0 0 rgba(0,240,255,0)',
  transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
  padding: '36px 28px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  position: 'relative',
  cursor: 'pointer',
  flexShrink: 0,
  textDecoration: 'none',
};

const cardHoverStyle = {
  boxShadow: '0 0 24px rgba(0,240,255,0.35), 0 0 48px rgba(0,240,255,0.12)',
  borderColor: 'rgba(0,240,255,0.7)',
};

function EventCard({ ev, index }) {
  const [hovered, setHovered] = useState(false);
  const days = daysUntil(ev.date);
  const dayLabel = days === 0 ? 'TODAY' : days === 1 ? 'TOMORROW' : `IN ${days} DAYS`;
  const cfg = getConfig(ev.category);
  const icon = getIcon(ev.category);
  const hasLink = ev.registrationLink || ev.link;
  const paddedIndex = String(index + 1).padStart(2, '0');

  const mergedStyle = {
    ...cardStyle,
    ...(hovered ? cardHoverStyle : {}),
    borderColor: hovered ? cfg.color : `${cfg.color}40`,
    boxShadow: hovered
      ? `0 0 20px ${cfg.color}55, 0 0 40px ${cfg.color}20`
      : '0 0 0 0 transparent',
  };

  const content = (
    <>
      {/* Top label + urgency badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.15em', color: cfg.color, opacity: 0.85, whiteSpace: 'nowrap' }}>
          [{paddedIndex}]
        </span>
        <span style={{
          fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.12em',
          color: cfg.color, border: `1px solid ${cfg.color}55`,
          background: `${cfg.color}15`, padding: '2px 8px', whiteSpace: 'nowrap',
        }}>
          {dayLabel}
        </span>
      </div>

      {/* Pixel icon */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
        <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', fontSize: '52px', lineHeight: 1, marginRight: '8px' }}>[</span>
        {icon}
        <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', fontSize: '52px', lineHeight: 1, marginLeft: '8px' }}>]</span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'monospace', fontWeight: 'bold', fontSize: '15px',
        color: hovered ? cfg.color : '#ffffff',
        marginBottom: '12px', letterSpacing: '0.08em', lineHeight: 1.3,
        transition: 'color 0.2s',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {ev.title || ev.name}
      </h3>

      {/* Meta */}
      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8', lineHeight: 1.8, marginBottom: '16px', flex: 1 }}>
        <div>◈ {formatDate(ev.date)}</div>
        {ev.time && <div>◷ {formatTime(ev.time)}{ev.endTime ? ` – ${formatTime(ev.endTime)}` : ''}</div>}
        {ev.location && <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>◎ {ev.location}</div>}
      </div>

      {/* CTA */}
      <div style={{
        fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.15em',
        color: hasLink ? cfg.color : 'rgba(255,255,255,0.25)',
        display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto',
      }}>
        <span>{hasLink ? 'SIGN UP' : 'SIGN UP COMING SOON'}</span>
        {hasLink && <span style={{ display: 'inline-block', transform: hovered ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 0.2s' }}>→</span>}
      </div>
    </>
  );

  if (hasLink) {
    return (
      <a
        href={hasLink}
        target="_blank"
        rel="noopener noreferrer"
        style={mergedStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      style={mergedStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {content}
    </div>
  );
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
    // Outer wrapper — no overflow clipping at all
    <div style={{ marginBottom: '32px' }}>

      {/* Header block — terminal style but no overflow:hidden */}
      <div
        className="terminal-block scanline-overlay"
        style={{ padding: '32px 32px 24px 32px', marginBottom: '0', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
      >
        <div className="relative z-10">
          <div className="font-mono-tech text-[#00F0FF]/80 text-sm tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="animate-flicker">&gt;_</span>
            <span>[SECTION: UPCOMING_EVENTS]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="text-xl font-bold text-white font-mono-tech tracking-widest">
                Next 14 Days
              </h2>
              <p className="text-[#94a3b8] font-mono-tech text-sm mt-1">
                {upcoming.length} event{upcoming.length !== 1 ? 's' : ''} incoming — click a card to register
              </p>
            </div>
            {upcoming.length > 2 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => scroll(-1)}
                  className="w-8 h-8 flex items-center justify-center border border-[#00F0FF]/40 text-[#00F0FF] font-mono-tech hover:bg-[#00F0FF]/10 transition-colors text-lg"
                  aria-label="Scroll left"
                >‹</button>
                <button
                  onClick={() => scroll(1)}
                  className="w-8 h-8 flex items-center justify-center border border-[#00F0FF]/40 text-[#00F0FF] font-mono-tech hover:bg-[#00F0FF]/10 transition-colors text-lg"
                  aria-label="Scroll right"
                >›</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card scroll row — completely outside any clipping container */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          overflowY: 'visible',
          padding: '24px 32px 28px 32px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#00F0FF33 transparent',
          background: 'rgba(0,240,255,0.02)',
          border: '1px solid rgba(0,240,255,0.15)',
          borderTop: 'none',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
        }}
      >
        {upcoming.map((ev, i) => (
          <EventCard key={ev.id || i} ev={ev} index={i} />
        ))}
      </div>
    </div>
  );
}
