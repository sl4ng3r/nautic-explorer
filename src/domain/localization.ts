export const TEXT_KEYS = {
  fleshBundle: 'item.nautic:flesh_bundle', potion: 'item.nautic:deep_breath_potion',
  basicFlippers: 'item.nautic:basic_flippers', diamondFlippers: 'item.nautic:diamond_flippers', guide: 'item.nautic:explorer_guide',
  pufferfish: 'nautic.ingredient.pufferfish', bottle: 'nautic.ingredient.bottle', kelpBlock: 'nautic.ingredient.kelp_block', leather: 'nautic.ingredient.leather', diamondBlock: 'nautic.ingredient.diamond_block', shell: 'nautic.ingredient.shell', rottenFlesh: 'nautic.ingredient.rotten_flesh',
  intro: 'nautic.guide.intro', settings: 'nautic.settings.title', settingsDescription: 'nautic.settings.description', icons: 'nautic.settings.icons', text: 'nautic.settings.text', off: 'nautic.settings.off', settingsUpdated: 'nautic.settings.updated',
  back: 'nautic.guide.back', effect: 'nautic.guide.effect', ingredients: 'nautic.guide.ingredients', instruction: 'nautic.guide.instruction', potionEffect: 'nautic.guide.potion_effect', speedEffect: 'nautic.guide.speed_effect', bundleEffect: 'nautic.guide.bundle_effect', quantity: 'nautic.guide.quantity',
  waterBreathing: 'nautic.status.water_breathing', flippers: 'nautic.status.flippers',
} as const;

export type Message = { text?: string; translate?: string; with?: string[] | Message; rawtext?: Message[] };
export const translate = (key: string): Message => ({ translate: key });
