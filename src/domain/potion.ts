export const WATER_BREATHING_DURATION_TICKS = 5 * 60 * 20;

export function mergeWaterBreathingDuration(currentTicks: number, requestedTicks = WATER_BREATHING_DURATION_TICKS): number {
  return Math.max(currentTicks, requestedTicks);
}

export function formatRemainingTime(ticks: number): string {
  const seconds = Math.max(0, Math.ceil(ticks / 20));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}
