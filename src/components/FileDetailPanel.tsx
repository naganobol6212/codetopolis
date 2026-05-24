"use client";

import { useMemo } from "react";
import type { Codebase } from "@/lib/types";
import { useSelectionStore } from "@/lib/store";

type Props = {
  codebase: Codebase;
};

export function FileDetailPanel({ codebase }: Props) {
  const selectedId = useSelectionStore((s) => s.selectedId);
  const setSelected = useSelectionStore((s) => s.setSelected);

  const file = useMemo(
    () => codebase.files.find((f) => f.id === selectedId) ?? null,
    [codebase.files, selectedId],
  );

  const dependsOn = useMemo(
    () =>
      selectedId
        ? codebase.edges.filter((e) => e.from === selectedId).map((e) => e.to)
        : [],
    [codebase.edges, selectedId],
  );

  const dependedBy = useMemo(
    () =>
      selectedId
        ? codebase.edges.filter((e) => e.to === selectedId).map((e) => e.from)
        : [],
    [codebase.edges, selectedId],
  );

  if (!file) return null;

  const accent = locToAccent(file.loc);
  const fileName = file.path.split("/").pop() ?? file.path;
  const dirName = file.path.slice(0, file.path.length - fileName.length);

  return (
    <aside
      key={file.id}
      className="pointer-events-auto absolute right-4 top-20 z-10 w-[340px] animate-panel-in"
    >
      <div className="glass-strong overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="relative px-4 pt-4 pb-3">
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }}
          />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="eyebrow flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: accent, color: accent }}
                />
                File
              </div>
              <div className="mt-1.5 font-mono text-[13px] font-semibold leading-tight text-foreground break-all">
                {fileName}
              </div>
              {dirName && (
                <div className="mt-0.5 font-mono text-[10.5px] text-[var(--text-muted)] break-all">
                  {dirName}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="-mr-1 -mt-1 rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-foreground"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 px-4">
          <StatCard label="LOC" value={file.loc} accent={accent} />
          <StatCard label="functions" value={file.functions} />
        </div>

        <div className="mt-4 mx-4 h-px bg-white/[0.06]" />

        {/* Sections */}
        <div className="max-h-[42vh] overflow-y-auto px-4 pb-4 pt-3">
          <Section
            title="Depends on"
            count={dependsOn.length}
            items={dependsOn}
          />
          <Section
            title="Depended by"
            count={dependedBy.length}
            items={dependedBy}
          />
          {file.imports.length > 0 && (
            <Section
              title="Raw imports"
              count={file.imports.length}
              items={file.imports}
              muted
            />
          )}
        </div>
      </div>
    </aside>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="relative rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2.5">
      <div className="eyebrow">{label}</div>
      <div
        className="mt-1 font-mono text-[18px] font-semibold tabular-nums"
        style={{ color: accent ?? "var(--foreground)" }}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  items,
  muted = false,
}: {
  title: string;
  count: number;
  items: string[];
  muted?: boolean;
}) {
  const setSelected = useSelectionStore((s) => s.setSelected);

  return (
    <div className="mt-3 first:mt-0">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">{title}</span>
        <span className="text-[10px] tabular-nums text-[var(--text-faint)]">
          {count}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="mt-1.5 text-[11px] text-[var(--text-faint)]">—</div>
      ) : (
        <ul className="mt-1.5 space-y-0.5">
          {items.map((it) => (
            <li key={it}>
              <button
                type="button"
                onClick={() => !muted && setSelected(it)}
                disabled={muted}
                className={`block w-full truncate rounded-md px-2 py-1 text-left font-mono text-[11px] transition-colors ${
                  muted
                    ? "text-[var(--text-muted)] cursor-default"
                    : "text-foreground/85 hover:bg-white/[0.05] hover:text-foreground"
                }`}
                title={it}
              >
                {it}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function locToAccent(loc: number): string {
  if (loc < 50) return "#22d3ee";
  if (loc < 150) return "#a78bfa";
  if (loc < 400) return "#f472b6";
  return "#ef4444";
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
