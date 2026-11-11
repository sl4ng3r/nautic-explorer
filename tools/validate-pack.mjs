import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const packRoot = join(root, "addon");
const jsonFiles = [];

async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (entry.name.endsWith(".json")) jsonFiles.push(path);
  }
}

await collect(packRoot);
for (const path of jsonFiles) JSON.parse(await readFile(path, "utf8"));
const behaviorManifest = JSON.parse(await readFile(join(packRoot, "behavior_pack/manifest.json"), "utf8"));
const resourceManifest = JSON.parse(await readFile(join(packRoot, "resource_pack/manifest.json"), "utf8"));
if (behaviorManifest.header.uuid === resourceManifest.header.uuid) throw new Error("Pack UUIDs must differ");
if (!behaviorManifest.modules.some((module) => module.type === "script")) throw new Error("Behavior pack script module missing");
const symbolsManifest = JSON.parse(await readFile(join(packRoot, "optional_symbols/manifest.json"), "utf8"));
const manifests = [behaviorManifest, resourceManifest, symbolsManifest];
const byUuid = new Map(manifests.map(manifest => [manifest.header.uuid, manifest]));
if (byUuid.size !== manifests.length) throw new Error("Pack UUIDs must be unique");
for (const manifest of manifests) {
  const reached = new Set();
  const visit = pack => {
    if (reached.has(pack.header.uuid)) return;
    reached.add(pack.header.uuid);
    for (const dependency of pack.dependencies ?? []) {
      if (!dependency.uuid) continue;
      const target = byUuid.get(dependency.uuid);
      if (!target) throw new Error(`Missing pack dependency: ${dependency.uuid}`);
      if (JSON.stringify(target.header.version) !== JSON.stringify(dependency.version)) throw new Error(`Dependency version mismatch: ${dependency.uuid}`);
      visit(target);
    }
  };
  visit(manifest);
  if (reached.size !== manifests.length) throw new Error(`Incomplete activation dependencies: ${manifest.header.name}`);
}
console.log(`Validated ${jsonFiles.length} JSON files and all three linked manifests.`);
