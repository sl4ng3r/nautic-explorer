import { TEXT_KEYS as K, translate, type Message } from './localization';

export const GUIDE_RECIPES = [
  { id: 'deep_breath_potion', title: translate(K.potion), effect: translate(K.potionEffect), ingredients: [
    { item: 'nautic:flesh_bundle', count: 2, name: K.fleshBundle, icon: 'textures/items/flesh_bundle.png' },
    { item: 'minecraft:pufferfish', count: 2, name: K.pufferfish, icon: 'textures/guide/items/fish_pufferfish_raw.png' },
    { item: 'minecraft:glass_bottle', count: 1, name: K.bottle, icon: 'textures/guide/items/potion_bottle_empty.png' },
  ] },
  { id: 'basic_flippers', title: translate(K.basicFlippers), effect: translate(K.speedEffect), ingredients: [
    { item: 'minecraft:dried_kelp_block', count: 3, name: K.kelpBlock, icon: 'textures/guide/blocks/dried_kelp_top.png' },
    { item: 'minecraft:leather', count: 6, name: K.leather, icon: 'textures/guide/items/leather.png' },
  ] },
  { id: 'diamond_flippers', title: translate(K.diamondFlippers), effect: translate(K.speedEffect), ingredients: [
    { item: 'nautic:basic_flippers', count: 1, name: K.basicFlippers, icon: 'textures/items/basic_flippers.png' },
    { item: 'minecraft:diamond_block', count: 1, name: K.diamondBlock, icon: 'textures/guide/blocks/diamond_block.png' },
    { item: 'minecraft:nautilus_shell', count: 2, name: K.shell, icon: 'textures/guide/items/nautilus.png' },
    { item: 'minecraft:dried_kelp_block', count: 2, name: K.kelpBlock, icon: 'textures/guide/blocks/dried_kelp_top.png' },
  ] },
  { id: 'flesh_bundle', title: translate(K.fleshBundle), effect: translate(K.bundleEffect), ingredients: [
    { item: 'minecraft:rotten_flesh', count: 9, name: K.rottenFlesh, icon: 'textures/guide/items/rotten_flesh.png' },
  ] },
];
export const GUIDE_RESOURCE_PACK = 'a7434372-bd01-49e8-9817-6a4ce9ebbb1a';
type Recipe = (typeof GUIDE_RECIPES)[number];
type RecipeForm = { header(text: Message): unknown; label(text: Message): unknown; image(path: string, pack: string, options: { width: number }): unknown; spacer(): unknown };
export function populateRecipeForm(form: RecipeForm, recipe: Recipe): void {
  form.header(translate(K.effect));
  form.label(recipe.effect);
  form.spacer();
  form.header(translate(K.ingredients));
  form.label(translate(K.instruction));
  for (const ingredient of recipe.ingredients) {
    form.image(ingredient.icon, GUIDE_RESOURCE_PACK, { width: 0.12 });
    form.label({ translate: K.quantity, with: { rawtext: [{ text: String(ingredient.count) }, translate(ingredient.name)] } });
  }
}
