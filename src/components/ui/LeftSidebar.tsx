"use client";

import type { Codebase, FileRole } from "@/lib/types";
import { ROLE_ORDER, ROLE_STYLES } from "@/lib/roles";

type Props = {
  codebase: Codebase;
};

export function LeftSidebar({ codebase }: Props) {
  const counts = countByRole(codebase);
  const items = ROLE_ORDER.filter((role) => counts[role] > 0);

  return (
    <aside className="pointer-events-none absolute left-4 top-20 z-10 w-60 animate-panel-in">
      <div className="glass pointer-events-auto rounded-2xl p-4">
        <div className="eyebrow">Roles</div>
        <ul className="mt-3 space-y-1.5">
          {items.map((role) => {
            const style = ROLE_STYLES[role];
            return (
              <li
                key={role}
                className="group flex items-center gap-3 rounded-lg px-1.5 py-1 transition-colors hover:bg-white/[0.04]"
              >
                <span
                  className="h-2.5 w-2.5 rounded-sm shadow-[0_0_8px_currentColor]"
                  style={{
                    backgroundColor: style.color,
                    color: style.color,
                  }}
                />
                <div className="flex flex-1 items-baseline justify-between">
                  <span className="text-[12px] font-medium text-foreground">
                    {style.label}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {style.description}
                  </span>
                </div>
                <span className="tabular-nums text-[10px] text-[var(--text-faint)] group-hover:text-[var(--text-muted)]">
                  {counts[role]}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="my-4 h-px bg-white/[0.06]" />

        <div className="eyebrow">Mappings</div>
        <dl className="mt-2 space-y-1.5 text-[11px]">
          <Mapping label="Height" value="lines of code" />
          <Mapping label="Width" value="function count" />
          <Mapping label="Color" value="file role" />
          <Mapping label="Halo" value="entry point" />
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

function countByRole(codebase: Codebase): Record<FileRole, number> {
  const counts: Record<FileRole, number> = {
    entry: 0,
    route: 0,
    component: 0,
    lib: 0,
    config: 0,
    test: 0,
    type: 0,
    other: 0,
  };
  for (const f of codebase.files) counts[f.role]++;
  return counts;
}
