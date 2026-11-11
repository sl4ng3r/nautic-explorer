import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist");
await rm(out, { recursive: true, force: true });
await mkdir(join(out, "behavior_pack/scripts"), { recursive: true });
await build({
  entryPoints: [join(root, "src/runtime/main.ts")],
  outfile: join(out, "behavior_pack/scripts/main.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  external: ["@minecraft/server", "@minecraft/server-ui"],
  sourcemap: false,
});
await cp(join(root, "addon"), out, { recursive: true });
