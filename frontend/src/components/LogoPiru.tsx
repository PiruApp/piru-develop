export function LogoPiru({ size = 32, showText = false }: { size?: number; showText?: boolean }) {
  const h = size;
  const w = showText ? h * 3.2 : h;
  return (
    <svg width={w} height={h} viewBox={showText ? "0 0 160 50" : "0 0 50 50"} fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      {/* Mountain back — dark */}
      <path d="M8 38L22 12L36 38Z" fill="#2D3142" />
      {/* Mountain front — terracotta */}
      <path d="M2 38L18 16L34 38Z" fill="#B84A39" />
      {/* Sun */}
      <circle cx="34" cy="14" r="6" fill="#E09F3E" />
      {/* Sun rays */}
      <g stroke="#E09F3E" strokeWidth="1.5" strokeLinecap="round">
        <line x1="34" y1="5" x2="34" y2="3" />
        <line x1="40.4" y1="7.6" x2="41.8" y2="6.2" />
        <line x1="43" y1="14" x2="45" y2="14" />
        <line x1="40.4" y1="20.4" x2="41.8" y2="21.8" />
      </g>
      {/* Circuit lines */}
      <g stroke="#6C665F" strokeWidth="1.2" strokeLinecap="round">
        <path d="M36 24L44 20" />
        <circle cx="46" cy="19" r="1.5" fill="#6C665F" />
        <path d="M38 28L46 25" />
        <circle cx="48" cy="24" r="1.5" fill="#6C665F" />
      </g>
      {/* Ground line */}
      <line x1="4" y1="40" x2="46" y2="40" stroke="#6C665F" strokeWidth="1.5" />
      {/* Diamond accent */}
      <rect x="23" y="42" width="4" height="4" rx="0.5" transform="rotate(45 25 44)" fill="#E09F3E" />

      {showText && (
        <text x="58" y="34" fontFamily="inherit" fontWeight="800" fontSize="28" letterSpacing="-0.02em" fill="currentColor">
          PIRU
        </text>
      )}
    </svg>
  );
}
