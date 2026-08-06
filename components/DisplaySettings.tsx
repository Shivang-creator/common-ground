"use client";

import { useEffect, useState, useRef } from "react";

type Prefs = {
  theme?: "light" | "dark";
  contrast?: "normal" | "high";
  font?: "sans" | "serif" | "mono";
  spacing?: "normal" | "roomy";
  motion?: "system" | "none";
  scale?: string;
};

const KEY = "cg:display";
const SCALES = ["0.9", "1", "1.15", "1.3", "1.5"];

function apply(p: Prefs) {
  const r = document.documentElement;
  p.theme ? r.setAttribute("data-theme", p.theme) : r.removeAttribute("data-theme");
  p.contrast ? r.setAttribute("data-contrast", p.contrast) : r.removeAttribute("data-contrast");
  r.setAttribute("data-font", p.font ?? "sans");
  p.spacing ? r.setAttribute("data-spacing", p.spacing) : r.removeAttribute("data-spacing");
  p.motion ? r.setAttribute("data-motion", p.motion) : r.removeAttribute("data-motion");
  r.style.setProperty("--font-scale", p.scale ?? "1");
}

/**
 * Display controls sit in the header on every page, always in the same place,
 * always reachable by keyboard. They are not hidden behind a "accessibility"
 * label — nobody should have to identify as needing them in order to find them.
 */
export function DisplaySettings() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      setPrefs(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const set = (patch: Prefs) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    apply(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const Group = ({
    label,
    hint,
    children,
  }: {
    label: string;
    hint?: string;
    children: React.ReactNode;
  }) => (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-sm font-semibold mb-1">{label}</legend>
      {hint && (
        <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );

  const Opt = ({
    on,
    onClick,
    children,
  }: {
    on: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="btn btn-quiet px-3 py-1.5 text-sm"
    >
      {children}
    </button>
  );

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="display-panel"
        className="btn btn-quiet px-3 py-2 text-sm"
      >
        Display
      </button>

      {open && (
        <div
          ref={panelRef}
          id="display-panel"
          role="dialog"
          aria-label="Display settings"
          className="card absolute right-0 mt-2 z-50 p-4 w-[min(22rem,calc(100vw-2rem))] space-y-4 shadow-lg"
        >
          <Group label="Text size">
            {SCALES.map((s, i) => (
              <Opt key={s} on={(prefs.scale ?? "1") === s} onClick={() => set({ scale: s })}>
                {["Smaller", "Default", "Large", "Larger", "Largest"][i]}
              </Opt>
            ))}
          </Group>

          <Group label="Spacing" hint="More space between lines, letters and words.">
            <Opt on={(prefs.spacing ?? "normal") === "normal"} onClick={() => set({ spacing: "normal" })}>
              Normal
            </Opt>
            <Opt on={prefs.spacing === "roomy"} onClick={() => set({ spacing: "roomy" })}>
              Roomy
            </Opt>
          </Group>

          <Group label="Typeface" hint="Pick whichever is easier for you to read. There is no correct answer.">
            <Opt on={(prefs.font ?? "sans") === "sans"} onClick={() => set({ font: "sans" })}>
              Sans
            </Opt>
            <Opt on={prefs.font === "serif"} onClick={() => set({ font: "serif" })}>
              Serif
            </Opt>
            <Opt on={prefs.font === "mono"} onClick={() => set({ font: "mono" })}>
              Monospace
            </Opt>
          </Group>

          <Group label="Colour">
            <Opt on={!prefs.theme} onClick={() => set({ theme: undefined })}>
              Match system
            </Opt>
            <Opt on={prefs.theme === "light"} onClick={() => set({ theme: "light" })}>
              Light
            </Opt>
            <Opt on={prefs.theme === "dark"} onClick={() => set({ theme: "dark" })}>
              Dark
            </Opt>
          </Group>

          <Group label="Contrast">
            <Opt on={(prefs.contrast ?? "normal") === "normal"} onClick={() => set({ contrast: "normal" })}>
              Normal
            </Opt>
            <Opt on={prefs.contrast === "high"} onClick={() => set({ contrast: "high" })}>
              High
            </Opt>
          </Group>

          <Group label="Movement" hint="This page has no animation by default.">
            <Opt on={(prefs.motion ?? "system") === "system"} onClick={() => set({ motion: "system" })}>
              Match system
            </Opt>
            <Opt on={prefs.motion === "none"} onClick={() => set({ motion: "none" })}>
              None
            </Opt>
          </Group>

          <div className="pt-1">
            <button
              type="button"
              className="btn btn-quiet px-3 py-1.5 text-sm"
              onClick={() => {
                setPrefs({});
                apply({});
                try {
                  localStorage.removeItem(KEY);
                } catch {}
              }}
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
