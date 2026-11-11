// src/runtime/main.ts
import { EquipmentSlot, EntityComponentTypes, system, world } from "@minecraft/server";
import { ActionFormData, CustomForm } from "@minecraft/server-ui";

// src/domain/flippers.ts
var BASIC_FLIPPER_MULTIPLIER = 1.2;
var DIAMOND_FLIPPER_MULTIPLIER = 1.6;
function multiplierForTier(tier) {
  if (tier === "diamond") return DIAMOND_FLIPPER_MULTIPLIER;
  if (tier === "basic") return BASIC_FLIPPER_MULTIPLIER;
  return 1;
}

// src/domain/localization.ts
var TEXT_KEYS = {
  fleshBundle: "item.nautic:flesh_bundle",
  potion: "item.nautic:deep_breath_potion",
  basicFlippers: "item.nautic:basic_flippers",
  diamondFlippers: "item.nautic:diamond_flippers",
  guide: "item.nautic:explorer_guide",
  pufferfish: "nautic.ingredient.pufferfish",
  bottle: "nautic.ingredient.bottle",
  kelpBlock: "nautic.ingredient.kelp_block",
  leather: "nautic.ingredient.leather",
  diamondBlock: "nautic.ingredient.diamond_block",
  shell: "nautic.ingredient.shell",
  rottenFlesh: "nautic.ingredient.rotten_flesh",
  intro: "nautic.guide.intro",
  settings: "nautic.settings.title",
  settingsDescription: "nautic.settings.description",
  icons: "nautic.settings.icons",
  text: "nautic.settings.text",
  off: "nautic.settings.off",
  settingsUpdated: "nautic.settings.updated",
  back: "nautic.guide.back",
  effect: "nautic.guide.effect",
  ingredients: "nautic.guide.ingredients",
  instruction: "nautic.guide.instruction",
  potionEffect: "nautic.guide.potion_effect",
  speedEffect: "nautic.guide.speed_effect",
  bundleEffect: "nautic.guide.bundle_effect",
  quantity: "nautic.guide.quantity",
  waterBreathing: "nautic.status.water_breathing",
  flippers: "nautic.status.flippers"
};
var translate = (key) => ({ translate: key });

// src/domain/guide.ts
var GUIDE_RECIPES = [
  { id: "deep_breath_potion", title: translate(TEXT_KEYS.potion), effect: translate(TEXT_KEYS.potionEffect), ingredients: [
    { item: "nautic:flesh_bundle", count: 2, name: TEXT_KEYS.fleshBundle, icon: "textures/items/flesh_bundle.png" },
    { item: "minecraft:pufferfish", count: 2, name: TEXT_KEYS.pufferfish, icon: "textures/guide/items/fish_pufferfish_raw.png" },
    { item: "minecraft:glass_bottle", count: 1, name: TEXT_KEYS.bottle, icon: "textures/guide/items/potion_bottle_empty.png" }
  ] },
  { id: "basic_flippers", title: translate(TEXT_KEYS.basicFlippers), effect: { translate: TEXT_KEYS.speedEffect, with: [String(Math.round((multiplierForTier("basic") - 1) * 100))] }, ingredients: [
    { item: "minecraft:dried_kelp_block", count: 3, name: TEXT_KEYS.kelpBlock, icon: "textures/guide/blocks/dried_kelp_top.png" },
    { item: "minecraft:leather", count: 6, name: TEXT_KEYS.leather, icon: "textures/guide/items/leather.png" }
  ] },
  { id: "diamond_flippers", title: translate(TEXT_KEYS.diamondFlippers), effect: { translate: TEXT_KEYS.speedEffect, with: [String(Math.round((multiplierForTier("diamond") - 1) * 100))] }, ingredients: [
    { item: "nautic:basic_flippers", count: 1, name: TEXT_KEYS.basicFlippers, icon: "textures/items/basic_flippers.png" },
    { item: "minecraft:diamond_block", count: 1, name: TEXT_KEYS.diamondBlock, icon: "textures/guide/blocks/diamond_block.png" },
    { item: "minecraft:nautilus_shell", count: 2, name: TEXT_KEYS.shell, icon: "textures/guide/items/nautilus.png" },
    { item: "minecraft:dried_kelp_block", count: 2, name: TEXT_KEYS.kelpBlock, icon: "textures/guide/blocks/dried_kelp_top.png" }
  ] },
  { id: "flesh_bundle", title: translate(TEXT_KEYS.fleshBundle), effect: translate(TEXT_KEYS.bundleEffect), ingredients: [
    { item: "minecraft:rotten_flesh", count: 9, name: TEXT_KEYS.rottenFlesh, icon: "textures/guide/items/rotten_flesh.png" }
  ] }
];
var GUIDE_RESOURCE_PACK = "a7434372-bd01-49e8-9817-6a4ce9ebbb1a";
function populateRecipeForm(form, recipe) {
  form.header(translate(TEXT_KEYS.effect));
  form.label(recipe.effect);
  form.spacer();
  form.header(translate(TEXT_KEYS.ingredients));
  form.label(translate(TEXT_KEYS.instruction));
  for (const ingredient of recipe.ingredients) {
    form.image(ingredient.icon, GUIDE_RESOURCE_PACK, { width: 0.12 });
    form.label({ translate: TEXT_KEYS.quantity, with: { rawtext: [{ text: String(ingredient.count) }, translate(ingredient.name)] } });
  }
}

// src/domain/hud.ts
var HUD_MARKER = "[nautic-hud]";
function encodeHudStatus(status) {
  return { rawtext: [{ text: HUD_MARKER }, ...status.rawtext] };
}

// src/domain/movement.ts
var same = (a, b) => Math.abs(a - b) < 1e-6;
var MovementController = class {
  states = /* @__PURE__ */ new Map();
  update(id, component, inWater, tier) {
    if (!component) {
      this.states.delete(id);
      return;
    }
    const active = inWater && tier !== "none";
    let state = this.states.get(id);
    if (!active) {
      if (state && !state.suspended && same(component.currentValue, state.applied)) component.setCurrentValue(state.base);
      this.states.delete(id);
      return;
    }
    if (!state) {
      state = { base: component.currentValue, applied: component.currentValue, suspended: false };
      this.states.set(id, state);
    } else if (!same(component.currentValue, state.applied)) {
      state.suspended = true;
    }
    if (state.suspended) return;
    const target = state.base * multiplierForTier(tier);
    if (!same(component.currentValue, target)) component.setCurrentValue(target);
    state.applied = component.currentValue;
  }
  forget(id) {
    this.states.delete(id);
  }
};

// src/domain/potion.ts
var WATER_BREATHING_DURATION_TICKS = 5 * 60 * 20;
function formatRemainingTime(ticks) {
  const seconds = Math.max(0, Math.ceil(ticks / 20));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

// src/domain/status.ts
function renderStatus(input) {
  if (input.mode === "off") return void 0;
  const parts = [];
  if (input.waterBreathingTicks > 0) {
    parts.push(input.mode === "icons" ? { text: "\u25CC" } : translate(TEXT_KEYS.waterBreathing));
    parts.push({ text: ` ${formatRemainingTime(input.waterBreathingTicks)}` });
  }
  if (input.isInWater && input.flipperTier !== "none") {
    if (parts.length) parts.push({ text: " \xA78\xB7\xA7r " });
    const percent = Math.round((multiplierForTier(input.flipperTier) - 1) * 100);
    parts.push(input.mode === "icons" ? { text: "\u224B" } : translate(TEXT_KEYS.flippers));
    parts.push({ text: ` +${percent}%` });
  }
  return parts.length ? { rawtext: parts } : void 0;
}

// src/runtime/main.ts
var GUIDE_ID = "nautic:explorer_guide";
var BASIC_FLIPPERS_ID = "nautic:basic_flippers";
var DIAMOND_FLIPPERS_ID = "nautic:diamond_flippers";
var BREATH_TICKS = 6e3;
var movementController = new MovementController();
function getFlipperTier(player) {
  const equippable = player.getComponent(EntityComponentTypes.Equippable);
  const feet = equippable?.getEquipment(EquipmentSlot.Feet);
  if (feet?.typeId === DIAMOND_FLIPPERS_ID) return "diamond";
  if (feet?.typeId === BASIC_FLIPPERS_ID) return "basic";
  return "none";
}
function getStatusMode(player) {
  if (player.hasTag("nautic_status_off")) return "off";
  if (player.hasTag("nautic_status_text")) return "text";
  return "icons";
}
function setStatusMode(player, mode) {
  for (const tag of ["nautic_status_off", "nautic_status_text", "nautic_status_icons"]) {
    if (player.hasTag(tag)) player.removeTag(tag);
  }
  if (mode === "off") player.addTag("nautic_status_off");
  if (mode === "text") player.addTag("nautic_status_text");
  if (mode === "icons") player.addTag("nautic_status_icons");
}
function statusText(player) {
  return renderStatus({
    mode: getStatusMode(player),
    waterBreathingTicks: player.getEffect("water_breathing")?.duration ?? 0,
    flipperTier: getFlipperTier(player),
    isInWater: player.isInWater
  });
}
function applyPotion(player) {
  const current = player.getEffect("water_breathing")?.duration ?? 0;
  player.addEffect("water_breathing", Math.max(current, BREATH_TICKS), {
    amplifier: 0,
    showParticles: false
  });
}
function updateFlipperSpeed(player) {
  movementController.update(player.id, player.getComponent("minecraft:movement"), player.isInWater, getFlipperTier(player));
}
async function showGuide(player) {
  const form = new ActionFormData().title("Nautic Explorer").body(translate(TEXT_KEYS.intro)).button(translate(TEXT_KEYS.potion), "textures/items/deep_breath_potion").button(translate(TEXT_KEYS.basicFlippers), "textures/items/basic_flippers").button(translate(TEXT_KEYS.diamondFlippers), "textures/items/diamond_flippers").button(translate(TEXT_KEYS.fleshBundle), "textures/items/flesh_bundle").button(translate(TEXT_KEYS.settings));
  const result = await form.show(player);
  if (result.canceled) return;
  if (result.selection === 4) return showStatusSettings(player);
  const guide = GUIDE_RECIPES[result.selection];
  if (guide) await showRecipe(player, guide);
}
async function showRecipe(player, guide) {
  const form = new CustomForm(player, guide.title);
  populateRecipeForm(form, guide);
  let goBack = false;
  form.button(translate(TEXT_KEYS.back), () => {
    goBack = true;
    form.close();
  });
  await form.show();
  if (goBack) await showGuide(player);
}
async function showStatusSettings(player) {
  const form = new ActionFormData().title(translate(TEXT_KEYS.settings)).body(translate(TEXT_KEYS.settingsDescription)).button(translate(TEXT_KEYS.icons)).button(translate(TEXT_KEYS.text)).button(translate(TEXT_KEYS.off));
  const result = await form.show(player);
  if (result.canceled) return;
  setStatusMode(player, ["icons", "text", "off"][result.selection]);
  player.sendMessage({ rawtext: [{ text: "\xA7bNautic Explorer\xA7r: " }, translate(TEXT_KEYS.settingsUpdated)] });
}
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent("nautic:deep_breath_consume", {
    onConsume(event) {
      if (event.source?.typeId === "minecraft:player") applyPotion(event.source);
    }
  });
});
world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  if (source?.typeId !== "minecraft:player") return;
  if (itemStack.typeId === GUIDE_ID) showGuide(source).catch(() => void 0);
});
world.afterEvents.playerLeave.subscribe(({ playerId }) => movementController.forget(playerId));
system.runInterval(() => {
  for (const player of world.getPlayers()) updateFlipperSpeed(player);
}, 1);
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const status = statusText(player);
    if (status) player.onScreenDisplay.setActionBar(encodeHudStatus(status));
  }
}, 10);
