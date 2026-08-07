/**
 * The hero figure.
 *
 * Deliberately static. No animation, no parallax, no motion of any kind — this is
 * a tool for people for whom sensory load is a documented barrier, and a moving
 * hero would contradict the product's own accessibility settings on the very first
 * screen.
 *
 * What it does instead is explain the product without a word of instruction: a
 * fragment of a real brief on the left with the vague parts marked, and what comes
 * back on the right. Someone who never reads the copy still understands it.
 *
 * Marked `aria-hidden` with a text equivalent alongside — it is decoration for
 * anyone using a screen reader, and the surrounding prose already says this.
 */
export function HeroFigure() {
  return (
    <figure className="my-2" aria-hidden="true">
      <svg
        viewBox="0 0 640 250"
        className="w-full h-auto"
        role="presentation"
        style={{ maxHeight: "260px" }}
      >
        {/* left: the brief, with the gaps marked */}
        <rect x="8" y="14" width="272" height="222" rx="10" fill="var(--surface)" stroke="var(--border)" />
        <text x="26" y="44" fontSize="12" fontWeight="600" fill="var(--text-muted)">
          The brief
        </text>

        {/* body lines */}
        {[64, 82, 118, 154, 190].map((y) => (
          <rect key={y} x="26" y={y} width="180" height="7" rx="3.5" fill="var(--border)" />
        ))}
        <rect x="26" y="100" width="140" height="7" rx="3.5" fill="var(--border)" />
        <rect x="26" y="136" width="205" height="7" rx="3.5" fill="var(--border)" />
        <rect x="26" y="172" width="120" height="7" rx="3.5" fill="var(--border)" />
        <rect x="26" y="208" width="165" height="7" rx="3.5" fill="var(--border)" />

        {/* the vague bits, highlighted — three of them, each a different severity */}
        <rect x="26" y="60" width="72" height="15" rx="4" fill="var(--blocker-soft)" stroke="var(--blocker)" strokeWidth="1" />
        <text x="32" y="71.5" fontSize="10" fontWeight="600" fill="var(--blocker)">
          discuss
        </text>

        <rect x="26" y="114" width="96" height="15" rx="4" fill="var(--friction-soft)" stroke="var(--friction)" strokeWidth="1" />
        <text x="32" y="125.5" fontSize="10" fontWeight="600" fill="var(--friction)">
          appropriate
        </text>

        <rect x="26" y="186" width="104" height="15" rx="4" fill="var(--note-soft)" stroke="var(--note)" strokeWidth="1" />
        <text x="32" y="197.5" fontSize="10" fontWeight="600" fill="var(--note)">
          as discussed
        </text>

        {/* the arrow across */}
        <path
          d="M292 125 H344"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M338 119 L346 125 L338 131" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* right: what comes back */}
        <rect x="358" y="14" width="274" height="222" rx="10" fill="var(--surface)" stroke="var(--border)" />
        <text x="376" y="44" fontSize="12" fontWeight="600" fill="var(--text-muted)">
          Questions worth asking
        </text>

        {[
          { y: 58, sev: "blocker", text: "Weigh both sides, or argue one?" },
          { y: 112, sev: "friction", text: "How many sources is enough?" },
          { y: 166, sev: "note", text: "What was assumed here?" },
        ].map((q) => (
          <g key={q.y}>
            <rect
              x="376"
              y={q.y}
              width="238"
              height="42"
              rx="7"
              fill={`var(--${q.sev}-soft)`}
              stroke={`var(--${q.sev})`}
              strokeWidth="1"
            />
            <text x="390" y={q.y + 19} fontSize="11" fontWeight="600" fill={`var(--${q.sev})`}>
              Ask
            </text>
            <text x="390" y={q.y + 33} fontSize="11" fill="var(--text)">
              {q.text}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
