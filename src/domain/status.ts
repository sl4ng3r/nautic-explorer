import { formatRemainingTime } from './potion';
import type { FlipperTier } from './flippers';
import { TEXT_KEYS as K, translate, type Message } from './localization';

export type StatusMode = 'icons' | 'text' | 'off';
export type StatusInput = { mode: StatusMode; waterBreathingTicks: number; flipperTier: FlipperTier; isInWater: boolean };
export function renderStatus(input: StatusInput): { rawtext: Message[] } | undefined {
  if (input.mode === 'off') return undefined;
  const parts: Message[] = [];
  if (input.waterBreathingTicks > 0) {
    parts.push(input.mode === 'icons' ? { text: '◌' } : translate(K.waterBreathing));
    parts.push({ text: ` ${formatRemainingTime(input.waterBreathingTicks)}` });
  }
  if (input.isInWater && input.flipperTier !== 'none') {
    if (parts.length) parts.push({ text: ' §8·§r ' });
    parts.push(input.mode === 'icons' ? { text: '≋' } : translate(K.flippers));
  }
  return parts.length ? { rawtext: parts } : undefined;
}
