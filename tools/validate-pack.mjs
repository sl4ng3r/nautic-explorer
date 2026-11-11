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
console.log(`Validated ${jsonFiles.length} JSON files and both manifests.`);
