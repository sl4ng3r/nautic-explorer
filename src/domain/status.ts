import { formatRemainingTime } from "./potion";
import { type FlipperTier, multiplierForTier } from "./flippers";

export type StatusMode = "icons" | "text" | "off";

export type StatusInput = {
  mode: StatusMode;
  waterBreathingTicks: number;
  flipperTier: FlipperTier;
  isInWater: boolean;
};

export function renderStatus(input: StatusInput): string {
  if (input.mode === "off") return "";
  const parts: string[] = [];
  if (input.waterBreathingTicks > 0) {
    const label = input.mode === "icons" ? "◌" : "Wasseratmung";
    parts.push(`${label} ${formatRemainingTime(input.waterBreathingTicks)}`);
  }
  if (input.isInWater && input.flipperTier !== "none") {
    const percent = Math.round((multiplierForTier(input.flipperTier) - 1) * 100);
    const label = input.mode === "icons" ? "≋" : "Flossen";
    parts.push(`${label} +${percent}%`);
  }
  return parts.join(" §8·§r ");
}
