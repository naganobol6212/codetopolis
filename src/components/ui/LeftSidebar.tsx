"use client";

import type { Codebase } from "@/lib/types";

type Props = {
  codebase: Codebase;
};

type LegendItem = {
  color: string;
  label: string;
  range: string;
};

const LEGEND: LegendItem[] = [
  { color: "#22d3ee", label: "Small", range: "< 50 LOC" },
  { color: "#a78bfa", label: "Medium", range: "50 – 150" },
  { color: "#f472b6", label: "Large", range: "150 – 400" },
  { color: "#ef4444", label: "Huge", range: "> 400" },
];

export function LeftSidebar({ codebase }: Props) {
  const buckets = bucketize(codebase);

  return (
    <aside className="pointer-events-none absolute left-4 top-20 z-10 w-56 animate-panel-in">
      <div className="glass pointer-events-auto rounded-2xl p-4">
        <div className="eyebrow">Legend</div>
        <ul className="mt-3 space-y-2">
          {LEGEND.map((item, i) => (
            <li
              key={item.label}
              className="group flex items-center gap-3 rounded-lg px-1.5 py-1 transition-colors hover:bg-white/[0.04]"
            >
              <span
                className="h-2.5 w-2.5 rounded-sm shadow-[0_0_8px_currentColor]"
                style={{
                  backgroundColor: item.color,
                  color: item.color,
                }}
              />
              <div className="flex flex-1 items-baseline justify-between">
                <span className="text-[12px] font-medium text-foreground">
                  {item.label}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {item.range}
                </span>
              </div>
              <span className="tabular-nums text-[10px] text-[var(--text-faint)] group-hover:text-[var(--text-muted)]">
                {buckets[i]}
              </span>
            </li>
          ))}
        </ul>

        <div className="my-4 h-px bg-white/[0.06]" />

        <div className="eyebrow">Mappings</div>
        <dl className="mt-2 space-y-1.5 text-[11px]">
          <Mapping label="Height" value="lines of code" />
          <Mapping label="Width" value="function count" />
          <Mapping label="Color" value="LOC bucket" />
        </dl>
      </div>
    </aside>
  );
}

function Mapping({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className="text-foreground/80">{value}</dd>
    </div>
  );
}

function bucketize(codebase: Codebase): [number, number, number, number] {
  let s = 0,
    m = 0,
    l = 0,
    h = 0;
  for (const f of codebase.files) {
    if (f.loc < 50) s++;
    else if (f.loc < 150) m++;
    else if (f.loc < 400) l++;
    else h++;
  }
  return [s, m, l, h];
}
