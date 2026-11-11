import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { RECIPES } from '../src/domain/recipes';
import { GUIDE_RECIPES } from '../src/domain/guide';

const readJson = (path: string) => JSON.parse(readFileSync(join('addon', path), 'utf8'));

describe('pack content', () => {
  it('matches every actual recipe to its documented ingredients and result', () => {
    for (const expected of RECIPES) {
      const recipe = readJson(`behavior_pack/recipes/${expected.id}.json`)['minecraft:recipe_shapeless'];
      const totals: Record<string, number> = {};
      for (const ingredient of recipe.ingredients) totals[ingredient.item] = (totals[ingredient.item] ?? 0) + (ingredient.count ?? 1);
      expect(totals).toEqual(Object.fromEntries(expected.ingredients.map(i => [i.item, i.count])));
      expect(recipe.result).toEqual(expected.output);
      expect(recipe.ingredients.length).toBeLessThanOrEqual(9);
    }
  });
  it('translates each explicit item display key in both languages', () => {
    for (const item of Object.values(RECIPES).filter(r => r.output.item.startsWith('nautic:'))) {
      const id = item.output.item.split(':')[1];
      const key = readJson(`behavior_pack/items/${id}.json`)['minecraft:item'].components['minecraft:display_name'].value;
      for (const locale of ['de_DE', 'en_US']) expect(readFileSync(`addon/resource_pack/texts/${locale}.lang`, 'utf8')).toContain(`${key}=`);
    }
  });
  it('shows the guide ingredients and their icons for each listed recipe', () => {
    for (const guide of GUIDE_RECIPES) {
      const recipe = RECIPES.find(r => r.id === guide.id)!;
      expect(guide.ingredients.map(i => [i.item, i.count])).toEqual(recipe.ingredients.map(i => [i.item, i.count]));
      expect(guide.ingredients.every(i => i.icon.startsWith('textures/'))).toBe(true);
      expect(guide.effect.translate).toBeTruthy();
    }
  });
  it('provides an icon for each selectable pack', () => {
    for (const pack of ['behavior_pack', 'resource_pack', 'optional_symbols']) expect(existsSync(`addon/${pack}/pack_icon.png`)).toBe(true);
  });
});
