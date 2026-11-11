import { mkdir, rm, cp } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";

const exec = promisify(execFile);
const root = new URL("..", import.meta.url).pathname;
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const releaseBuild = process.argv.includes("--release");
const out = join(root, releaseBuild ? "release" : "test");
const archiveName = releaseBuild
  ? `nautic-explorer-${packageJson.version}.mcaddon`
  : "nautic-explorer.mcaddon";
const staging = join(out, ".staging");
if (!releaseBuild) {
  await rm(out, { recursive: true, force: true });
}
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
await cp(join(root, "dist/behavior_pack"), join(staging, "NauticExplorer_BP"), { recursive: true });
await cp(join(root, "dist/resource_pack"), join(staging, "NauticExplorer_RP"), { recursive: true });
await cp(join(root, "dist/optional_symbols"), join(staging, "NauticExplorer_Symbols"), { recursive: true });
for (const [folder, archive] of [
  ["NauticExplorer_BP", "NauticExplorer_BP.mcpack"],
  ["NauticExplorer_RP", "NauticExplorer_RP.mcpack"],
  ["NauticExplorer_Symbols", "NauticExplorer_Symbols.mcpack"],
]) {
  await exec("zip", ["-qr", join(staging, archive), "."], { cwd: join(staging, folder) });
}
await exec("zip", ["-qr", join(out, archiveName), "NauticExplorer_BP.mcpack", "NauticExplorer_RP.mcpack", "NauticExplorer_Symbols.mcpack"], { cwd: staging });
await rm(staging, { recursive: true, force: true });
console.log(`Created ${join(out, archiveName)}`);
