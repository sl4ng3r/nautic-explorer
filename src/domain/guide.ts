export const GUIDE_RECIPES = [
  { id: 'deep_breath_potion', title: 'Trank der Tiefenatmung', effect: '5 Minuten Wasseratmung.', ingredients: [
    { item: 'nautic:flesh_bundle', count: 2, name: 'Fleischbündel', icon: 'textures/items/flesh_bundle' },
    { item: 'minecraft:pufferfish', count: 2, name: 'Kugelfisch', icon: 'textures/items/fish_pufferfish_raw' },
    { item: 'minecraft:glass_bottle', count: 1, name: 'Glasflasche', icon: 'textures/items/potion_bottle_empty' },
  ] },
  { id: 'basic_flippers', title: 'Einfache Flossen', effect: '10 Prozent schneller im Wasser.', ingredients: [
    { item: 'minecraft:dried_kelp_block', count: 3, name: 'Getrockneter Seetangblock', icon: 'textures/blocks/dried_kelp_top' },
    { item: 'minecraft:leather', count: 6, name: 'Leder', icon: 'textures/items/leather' },
  ] },
  { id: 'diamond_flippers', title: 'Diamantflossen', effect: '50 Prozent schneller im Wasser.', ingredients: [
    { item: 'nautic:basic_flippers', count: 1, name: 'Einfache Flossen', icon: 'textures/items/basic_flippers' },
    { item: 'minecraft:diamond_block', count: 1, name: 'Diamantblock', icon: 'textures/blocks/diamond_block' },
    { item: 'minecraft:nautilus_shell', count: 2, name: 'Nautilusschale', icon: 'textures/items/nautilus' },
    { item: 'minecraft:dried_kelp_block', count: 2, name: 'Getrockneter Seetangblock', icon: 'textures/blocks/dried_kelp_top' },
  ] },
  { id: 'flesh_bundle', title: 'Fleischbündel', effect: 'Ergibt ein Fleischbündel.', ingredients: [
    { item: 'minecraft:rotten_flesh', count: 9, name: 'Verrottetes Fleisch', icon: 'textures/items/rotten_flesh' },
  ] },
];
