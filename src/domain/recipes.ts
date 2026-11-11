export type Ingredient = { item: string; count: number };

export type RecipeDefinition = {
  id: string;
  output: { item: string; count: number };
  ingredients: Ingredient[];
  shapeless: true;
};

export const ITEMS = {
  fleshBundle: "nautic:flesh_bundle",
  deepBreathPotion: "nautic:deep_breath_potion",
  basicFlippers: "nautic:basic_flippers",
  diamondFlippers: "nautic:diamond_flippers",
  explorerGuide: "nautic:explorer_guide",
} as const;

export const RECIPES: RecipeDefinition[] = [
  {
    id: "flesh_bundle",
    output: { item: ITEMS.fleshBundle, count: 1 },
    shapeless: true,
    ingredients: [{ item: "minecraft:rotten_flesh", count: 9 }],
  },
  {
    id: "flesh_bundle_unpack",
    output: { item: "minecraft:rotten_flesh", count: 9 },
    shapeless: true,
    ingredients: [{ item: ITEMS.fleshBundle, count: 1 }],
  },
  {
    id: "deep_breath_potion",
    output: { item: ITEMS.deepBreathPotion, count: 1 },
    shapeless: true,
    ingredients: [
      { item: ITEMS.fleshBundle, count: 2 },
      { item: "minecraft:pufferfish", count: 2 },
      { item: "minecraft:glass_bottle", count: 1 },
    ],
  },
  {
    id: "basic_flippers",
    output: { item: ITEMS.basicFlippers, count: 1 },
    shapeless: true,
    ingredients: [
      { item: "minecraft:dried_kelp_block", count: 3 },
      { item: "minecraft:leather", count: 6 },
    ],
  },
  {
    id: "diamond_flippers",
    output: { item: ITEMS.diamondFlippers, count: 1 },
    shapeless: true,
    ingredients: [
      { item: ITEMS.basicFlippers, count: 1 },
      { item: "minecraft:diamond_block", count: 1 },
      { item: "minecraft:nautilus_shell", count: 2 },
      { item: "minecraft:dried_kelp_block", count: 2 },
    ],
  },
  {
    id: "explorer_guide",
    output: { item: ITEMS.explorerGuide, count: 1 },
    shapeless: true,
    ingredients: [
      { item: "minecraft:book", count: 1 },
      { item: "minecraft:dried_kelp", count: 1 },
    ],
  },
];

export function ingredientCount(recipeId: string, item: string): number {
  return RECIPES.find((recipe) => recipe.id === recipeId)?.ingredients.find((entry) => entry.item === item)?.count ?? 0;
}
