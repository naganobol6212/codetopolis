"use client";

export function FooterHint() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4 animate-panel-in">
      <div className="glass pointer-events-auto flex items-center gap-3 rounded-full px-3.5 py-1.5 text-[10.5px] text-[var(--text-muted)]">
        <Hint icon="◉" label="Click" desc="select a building" />
        <Sep />
        <Hint icon="⇕" label="Scroll" desc="zoom" />
        <Sep />
        <Hint icon="↻" label="Drag" desc="orbit" />
      </div>
    </div>
  );
}

function Hint({
  icon,
  label,
  desc,
}: {
  icon: string;
  label: string;
  desc: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-[var(--text-faint)]">{icon}</span>
      <span className="font-medium text-foreground/85">{label}</span>
      <span className="text-[var(--text-muted)]">{desc}</span>
    </span>
  );
}

function Sep() {
  return <span className="h-3 w-px bg-white/[0.08]" />;
}
