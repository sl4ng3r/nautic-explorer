import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { GUIDE_RECIPES, populateRecipeForm } from '../src/domain/guide';
import { TEXT_KEYS } from '../src/domain/localization';

describe('recipe guide', () => {
  it('renders each ingredient as an image and a translatable quantity label', () => {
    const calls: Array<[string, ...unknown[]]> = [];
    const form = {
      header: (text: unknown) => { calls.push(['header', text]); },
      label: (text: unknown) => { calls.push(['label', text]); },
      image: (path: string, pack: string, options: unknown) => { calls.push(['image', path, pack, options]); },
      spacer: () => { calls.push(['spacer']); },
    };
    populateRecipeForm(form, GUIDE_RECIPES[0]);
    expect(calls.filter(c => c[0] === 'image')).toHaveLength(3);
    expect(calls).toContainEqual(['label', { translate: TEXT_KEYS.quantity, with: { rawtext: [{ text: '2' }, { translate: TEXT_KEYS.fleshBundle }] } }]);
    expect(calls.some(c => c[0] === 'button')).toBe(false);
    for (const recipe of GUIDE_RECIPES) for (const ingredient of recipe.ingredients) expect(existsSync(`addon/resource_pack/${ingredient.icon}`)).toBe(true);
  });
  it('passes the configured flipper percentages to translations', () => {
    expect(GUIDE_RECIPES[1].effect).toEqual({ translate: TEXT_KEYS.speedEffect, with: ['20'] });
    expect(GUIDE_RECIPES[2].effect).toEqual({ translate: TEXT_KEYS.speedEffect, with: ['60'] });
  });
});
