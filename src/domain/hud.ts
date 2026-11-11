export const HUD_MARKER = '[nautic-hud]';

export function encodeHudStatus(status: string): string {
  return status ? HUD_MARKER + status : '';
}
