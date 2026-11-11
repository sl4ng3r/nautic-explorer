export type FlipperTier = "none" | "basic" | "diamond";

export function tierForItemId(itemId: string | undefined): FlipperTier {
  if (itemId === "nautic:diamond_flippers") return "diamond";
  if (itemId === "nautic:basic_flippers") return "basic";
  return "none";
}

