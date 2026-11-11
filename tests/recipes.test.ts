import { ITEMS, RECIPES, ingredientCount } from "../src/domain/recipes";

describe("Nautic Explorer recipes", () => {
  it("uses two flesh bundles and two pufferfish for one potion", () => {
    expect(ingredientCount("deep_breath_potion", ITEMS.fleshBundle)).toBe(2);
    expect(ingredientCount("deep_breath_potion", "minecraft:pufferfish")).toBe(2);
    expect(ingredientCount("deep_breath_potion", "minecraft:glass_bottle")).toBe(1);
  });

  it("costs three dried kelp blocks and six leather for basic flippers", () => {
    expect(ingredientCount("basic_flippers", "minecraft:dried_kelp_block")).toBe(3);
    expect(ingredientCount("basic_flippers", "minecraft:leather")).toBe(6);
  });

  it("requires a diamond block and two nautilus shells for the upgrade", () => {
    expect(ingredientCount("diamond_flippers", "minecraft:diamond_block")).toBe(1);
    expect(ingredientCount("diamond_flippers", "minecraft:nautilus_shell")).toBe(2);
  });

  it("keeps all recipes shapeless", () => {
    expect(RECIPES.every((recipe) => recipe.shapeless)).toBe(true);
  });
});
