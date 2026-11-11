import type { Message } from './localization';
export const HUD_MARKER = '[nautic-hud]';
export function encodeHudStatus(status: { rawtext: Message[] }): { rawtext: Message[] } {
  return { rawtext: [{ text: HUD_MARKER }, ...status.rawtext] };
}
