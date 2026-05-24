import { CityScene } from "@/components/CityScene";
import { FileDetailPanel } from "@/components/FileDetailPanel";
import { loadCodebase } from "@/lib/codebase";

export default async function Home() {
  const codebase = await loadCodebase();

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#05060a]">
      <CityScene codebase={codebase} />
      <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-md bg-slate-900/80 px-3 py-2 text-sm text-slate-100 shadow">
        <div className="font-semibold">codetopolis</div>
        <div className="text-slate-300">
          {codebase.files.length} files · {codebase.edges.length} edges
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          click a building · scroll to zoom · drag to rotate
        </div>
      </div>
      <FileDetailPanel codebase={codebase} />
    </main>
  );
}
