import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DisplaySettings } from "@/components/DisplaySettings";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Common Ground — make the unwritten rules written",
  description:
    "Group projects fail people for reasons that have nothing to do with the work. Common Ground turns an ambiguous brief into explicit questions, and a group into explicit roles.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Never block zoom.
  maximumScale: 5,
  userScalable: true,
};

/**
 * Preferences are read before first paint so the page never flashes in the wrong
 * size or colour — a flash is a genuine problem for people sensitive to sudden
 * visual change, not just a polish issue.
 */
const BOOT = `(function(){try{var p=JSON.parse(localStorage.getItem("cg:display")||"{}");var r=document.documentElement;
if(p.theme)r.setAttribute("data-theme",p.theme);
if(p.contrast)r.setAttribute("data-contrast",p.contrast);
if(p.font)r.setAttribute("data-font",p.font);
if(p.lines)r.setAttribute("data-lines",p.lines);
if(p.letters)r.setAttribute("data-letters",p.letters);
if(p.tint)r.setAttribute("data-tint",p.tint);
if(p.motion)r.setAttribute("data-motion",p.motion);
if(p.scale)r.style.setProperty("--font-scale",p.scale);
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-font="sans" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body className={`${inter.variable} ${mono.variable} antialiased`}>
        <a href="#main" className="skip-link">Skip to main content</a>
        <div className="min-h-dvh flex flex-col">
          <header className="no-print border-b" style={{ borderColor: "var(--border)" }}>
            <div className="mx-auto w-full max-w-5xl px-4 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 min-w-0">
                <a href="/" className="font-semibold tracking-tight text-lg" style={{ color: "var(--text)" }}>
                  Common&nbsp;Ground
                </a>
                <nav aria-label="Sections" className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  <a href="/" className="underline-offset-4 hover:underline" style={{ color: "var(--text-muted)" }}>
                    Read a brief
                  </a>
                  <a href="/group" className="underline-offset-4 hover:underline" style={{ color: "var(--text-muted)" }}>
                    Split the work
                  </a>
                  <a href="/log" className="underline-offset-4 hover:underline" style={{ color: "var(--text-muted)" }}>
                    Decisions
                  </a>
                  <a href="/share" className="underline-offset-4 hover:underline" style={{ color: "var(--text-muted)" }}>
                    Share
                  </a>
                  <a href="/checks" className="underline-offset-4 hover:underline" style={{ color: "var(--text-muted)" }}>
                    Checks
                  </a>
                  <a href="/judges" className="underline-offset-4 hover:underline" style={{ color: "var(--text-muted)" }}>
                    Walkthrough
                  </a>
                </nav>
              </div>
              <DisplaySettings />
            </div>
          </header>
          <main id="main" className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
            {children}
          </main>
          <footer
            className="no-print border-t mt-8"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm measure">
              <p>
                Common Ground never asks who you are, never stores what you paste, and never
                reports anything about a person. It reads documents and describes processes.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
