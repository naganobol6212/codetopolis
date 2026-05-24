import { CityScene } from "@/components/CityScene";
import { FileDetailPanel } from "@/components/FileDetailPanel";
import { TopBar } from "@/components/ui/TopBar";
import { LeftSidebar } from "@/components/ui/LeftSidebar";
import { FooterHint } from "@/components/ui/FooterHint";
import { loadCodebase } from "@/lib/codebase";

export default async function Home() {
  const codebase = await loadCodebase();

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#05060a]">
      <CityScene codebase={codebase} />
      <TopBar codebase={codebase} />
      <LeftSidebar codebase={codebase} />
      <FileDetailPanel codebase={codebase} />
      <FooterHint />
    </main>
  );
}
