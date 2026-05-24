"use client";

import type { Codebase } from "@/lib/types";

type Props = {
  codebase: Codebase;
};

export function TopBar({ codebase }: Props) {
  const totalLoc = codebase.files.reduce((sum, f) => sum + f.loc, 0);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-4 animate-panel-in">
      <div className="glass pointer-events-auto flex h-12 w-full max-w-5xl items-center gap-3 rounded-2xl px-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 pl-1 pr-2">
          <BrandMark />
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-semibold tracking-tight text-foreground">
              codetopolis
            </span>
            <span className="hidden text-[10px] font-medium text-[var(--text-faint)] sm:inline">
              v0.1
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-white/8" />

        {/* Search (visual only — wired up in Step D) */}
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-1.5 text-[12px] text-[var(--text-muted)] transition-colors hover:border-white/[0.12] focus-within:border-white/[0.18]">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search files, modules, or dependencies…"
            disabled
            className="flex-1 bg-transparent text-foreground placeholder:text-[var(--text-muted)] focus:outline-none disabled:cursor-not-allowed"
            aria-label="Search"
          />
          <kbd className="hidden rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)] sm:inline">
            ⌘K
          </kbd>
        </div>

        <div className="h-5 w-px bg-white/8" />

        {/* Stats */}
        <div className="hidden items-center gap-4 pr-1 text-[11px] md:flex">
          <Stat label="files" value={codebase.files.length} />
          <Stat label="edges" value={codebase.edges.length} />
          <Stat label="loc" value={totalLoc} />
        </div>

        {/* Live status */}
        <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-soft-pulse" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-300/80">
            live
          </span>
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="tabular-nums font-medium text-foreground">
        {value.toLocaleString()}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/30 via-violet-500/30 to-pink-500/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_18px_-4px_rgba(167,139,250,0.6)]">
      <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-cyan-300 to-violet-400" />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[var(--text-muted)]"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
