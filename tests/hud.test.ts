import { readFileSync } from 'node:fs';
import { encodeHudStatus } from '../src/domain/hud';

describe('Nautic HUD routing', () => {
  it('preserves translation components after the routing marker', () => {
    expect(encodeHudStatus({ rawtext: [{ translate: 'nautic.status.water_breathing' }, { text: ' 4:59' }] })).toEqual({ rawtext: [{ text: '[nautic-hud]' }, { translate: 'nautic.status.water_breathing' }, { text: ' 4:59' }] });
  });
  it('routes marked messages and keeps other messages in the vanilla actionbar', () => {
    const ui = JSON.parse(readFileSync('addon/resource_pack/ui/hud_screen.json', 'utf8'));
    expect(ui.hud_actionbar_text.visible).toContain('[nautic-hud]');
    expect(ui.nautic_status.visible).toContain('[nautic-hud]');
    expect(ui.nautic_status.text).toContain('[nautic-hud]');
    expect(ui.nautic_status.anchor_to).toBe('top_right');
    expect(ui.nautic_status.offset).toEqual([-4, 4]);
  });
});
