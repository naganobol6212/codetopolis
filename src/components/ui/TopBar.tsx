"use client";

import type { Codebase } from "@/lib/types";
import { useSelectionStore } from "@/lib/store";

type Props = {
  codebase: Codebase;
};

export function TopBar({ codebase }: Props) {
  const totalLoc = codebase.files.reduce((sum, f) => sum + f.loc, 0);
  const visitedCount = useSelectionStore((s) => s.visitedIds.size);
  const totalFiles = codebase.files.length;
  const explored = Math.min(visitedCount, totalFiles);
  const pct = totalFiles === 0 ? 0 : (explored / totalFiles) * 100;
  const complete = explored >= totalFiles && totalFiles > 0;

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
          <Stat label="edges" value={codebase.edges.length} />
          <Stat label="loc" value={totalLoc} />
        </div>

        {/* Discovery progress — gamey "X of Y explored" with a bar */}
        <div
          className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/20 px-2.5 py-1"
          title="Click buildings to explore the city"
        >
          <CompassIcon complete={complete} />
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1 leading-none">
              <span className="tabular-nums text-[11px] font-semibold text-foreground">
                {explored}
              </span>
              <span className="text-[9px] text-[var(--text-muted)]">
                / {totalFiles}
              </span>
              <span className="ml-0.5 text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                {complete ? "mapped" : "explored"}
              </span>
            </div>
            <div className="h-[3px] w-24 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  background: complete
                    ? "linear-gradient(90deg, #34d399, #fbbf24)"
                    : "linear-gradient(90deg, #22d3ee, #a855f7)",
                  boxShadow: complete
                    ? "0 0 10px rgba(251,191,36,0.6)"
                    : "0 0 8px rgba(168,85,247,0.4)",
                }}
              />
            </div>
          </div>
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

function CompassIcon({ complete }: { complete: boolean }) {
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
      className={complete ? "text-amber-300" : "text-cyan-300/80"}
      style={
        complete
          ? { filter: "drop-shadow(0 0 4px rgba(251,191,36,0.7))" }
          : undefined
      }
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <polygon points="14.5,9.5 11,13 9.5,14.5 13,11" fill="currentColor" />
    </svg>
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
