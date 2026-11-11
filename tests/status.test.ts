import { renderStatus } from '../src/domain/status';
import { TEXT_KEYS } from '../src/domain/localization';

describe('status bar', () => {
  it('sends translation keys and dynamic values for text mode', () => {
    expect(renderStatus({ mode: 'text', waterBreathingTicks: 6000, flipperTier: 'diamond', isInWater: true })).toEqual({ rawtext: [
      { translate: TEXT_KEYS.waterBreathing }, { text: ' 5:00' }, { text: ' §8·§r ' }, { translate: TEXT_KEYS.flippers }, { text: ' +60%' },
    ] });
  });
  it('keeps symbols without translations in icon mode', () => {
    expect(renderStatus({ mode: 'icons', waterBreathingTicks: 6000, flipperTier: 'none', isInWater: true })).toEqual({ rawtext: [{ text: '◌' }, { text: ' 5:00' }] });
  });
  it('returns no status on land without effects or when disabled', () => {
    expect(renderStatus({ mode: 'text', waterBreathingTicks: 0, flipperTier: 'basic', isInWater: false })).toBeUndefined();
    expect(renderStatus({ mode: 'off', waterBreathingTicks: 6000, flipperTier: 'diamond', isInWater: true })).toBeUndefined();
  });
});
