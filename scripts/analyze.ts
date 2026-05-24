import { Project, SyntaxKind, SourceFile } from "ts-morph";
import * as path from "node:path";
import * as fs from "node:fs";

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const SCRIPTS_DIR = path.join(ROOT, "scripts");
const OUT_FILE = path.join(ROOT, "public", "codebase.json");

type FileRole =
  | "entry"
  | "route"
  | "component"
  | "lib"
  | "config"
  | "test"
  | "type"
  | "other";

const APP_ROUTER_ENTRY_NAMES = new Set([
  "page.tsx",
  "page.ts",
  "layout.tsx",
  "layout.ts",
  "template.tsx",
  "template.ts",
  "error.tsx",
  "loading.tsx",
  "not-found.tsx",
  "default.tsx",
]);

const ROUTE_HANDLER_NAMES = new Set(["route.ts", "route.tsx"]);

type FileNode = {
  id: string;
  path: string;
  loc: number;
  functions: number;
  imports: string[];
  role: FileRole;
};

type Edge = {
  from: string;
  to: string;
};

type Codebase = {
  files: FileNode[];
  edges: Edge[];
  generatedAt: string;
};

function toRelative(absPath: string): string {
  return path.relative(ROOT, absPath).split(path.sep).join("/");
}

function countLines(source: string): number {
  if (!source) return 0;
  return source.split("\n").length;
}

function countFunctions(sf: SourceFile): number {
  const kinds = [
    SyntaxKind.FunctionDeclaration,
    SyntaxKind.MethodDeclaration,
    SyntaxKind.ArrowFunction,
    SyntaxKind.FunctionExpression,
  ];
  return kinds.reduce(
    (sum, k) => sum + sf.getDescendantsOfKind(k).length,
    0,
  );
}

function classifyRole(id: string): FileRole {
  const base = id.split("/").pop() ?? id;
  const lower = id.toLowerCase();

  if (lower.endsWith(".d.ts")) return "type";
  if (/\.(test|spec)\.(t|j)sx?$/.test(lower) || lower.includes("/__tests__/")) {
    return "test";
  }
  if (/\.config\.(t|j)sx?$/.test(lower) || base.startsWith("next.config.")) {
    return "config";
  }
  if (id.startsWith("src/app/")) {
    if (APP_ROUTER_ENTRY_NAMES.has(base)) return "entry";
    if (ROUTE_HANDLER_NAMES.has(base)) return "route";
  }
  if (id.startsWith("scripts/")) return "entry";
  if (id.includes("/components/")) return "component";
  if (
    id.includes("/lib/") ||
    id.includes("/utils/") ||
    id.includes("/hooks/") ||
    id.includes("/helpers/")
  ) {
    return "lib";
  }
  return "other";
}

function resolveImport(
  fromFile: SourceFile,
  moduleSpecifier: string,
  knownIds: Set<string>,
): string | null {
  if (!moduleSpecifier.startsWith(".")) return null;

  const fromDir = path.dirname(fromFile.getFilePath());
  const candidates = [
    moduleSpecifier,
    `${moduleSpecifier}.ts`,
    `${moduleSpecifier}.tsx`,
    `${moduleSpecifier}/index.ts`,
    `${moduleSpecifier}/index.tsx`,
  ];

  for (const candidate of candidates) {
    const absResolved = path.resolve(fromDir, candidate);
    const id = toRelative(absResolved);
    if (knownIds.has(id)) return id;
  }
  return null;
}

function analyze(): Codebase {
  const project = new Project({
    tsConfigFilePath: path.join(ROOT, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  project.addSourceFilesAtPaths([
    `${SRC_DIR}/**/*.ts`,
    `${SRC_DIR}/**/*.tsx`,
    `${SCRIPTS_DIR}/**/*.ts`,
  ]);

  const sourceFiles = project.getSourceFiles();
  const knownIds = new Set(sourceFiles.map((sf) => toRelative(sf.getFilePath())));

  const files: FileNode[] = [];
  const edges: Edge[] = [];

  for (const sf of sourceFiles) {
    const id = toRelative(sf.getFilePath());
    const importDecls = sf.getImportDeclarations();
    const imports = importDecls.map((d) => d.getModuleSpecifierValue());

    files.push({
      id,
      path: id,
      loc: countLines(sf.getFullText()),
      functions: countFunctions(sf),
      imports,
      role: classifyRole(id),
    });

    for (const spec of imports) {
      const targetId = resolveImport(sf, spec, knownIds);
      if (targetId) {
        edges.push({ from: id, to: targetId });
      }
    }
  }

  return {
    files,
    edges,
    generatedAt: new Date().toISOString(),
  };
}

function main() {
  const codebase = analyze();
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(codebase, null, 2));
  console.log(
    `[analyze] wrote ${codebase.files.length} files, ${codebase.edges.length} edges -> ${toRelative(OUT_FILE)}`,
  );
}

main();
