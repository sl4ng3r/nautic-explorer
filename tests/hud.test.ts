import { readFileSync } from 'node:fs';
import { encodeHudStatus } from '../src/domain/hud';

describe('Nautic HUD routing', () => {
  it('marks only nonempty status messages', () => {
    expect(encodeHudStatus('◌ 4:59')).toBe('[nautic-hud]◌ 4:59');
    expect(encodeHudStatus('')).toBe('');
  });
  it('routes marked messages and keeps other messages in the vanilla actionbar', () => {
    const ui = JSON.parse(readFileSync('addon/resource_pack/ui/hud_screen.json', 'utf8'));
    expect(ui.hud_actionbar_text.visible).toContain('[nautic-hud]');
    expect(ui.nautic_status.visible).toContain('[nautic-hud]');
    expect(ui.nautic_status.text).toContain('[nautic-hud]');
    expect(ui.nautic_status.anchor_to).toBe('top_right');
  });
});
