export const BASIC_FLIPPER_MULTIPLIER = 1.2;
export const DIAMOND_FLIPPER_MULTIPLIER = 1.6;

export type FlipperTier = "none" | "basic" | "diamond";

export function multiplierForTier(tier: FlipperTier): number {
  if (tier === "diamond") return DIAMOND_FLIPPER_MULTIPLIER;
  if (tier === "basic") return BASIC_FLIPPER_MULTIPLIER;
  return 1;
}

export function tierForItemId(itemId: string | undefined): FlipperTier {
  if (itemId === "nautic:diamond_flippers") return "diamond";
  if (itemId === "nautic:basic_flippers") return "basic";
  return "none";
}

export function scaleWaterSpeed(base: number, tier: FlipperTier): number {
  return base * multiplierForTier(tier);
}
