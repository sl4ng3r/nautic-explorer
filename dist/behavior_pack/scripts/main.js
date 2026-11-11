// src/runtime/main.ts
import { EquipmentSlot, EntityComponentTypes, system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

// src/domain/guide.ts
var GUIDE_RECIPES = [
  { id: "deep_breath_potion", title: "Trank der Tiefenatmung", effect: "5 Minuten Wasseratmung.", ingredients: [
    { item: "nautic:flesh_bundle", count: 2, name: "Fleischb\xFCndel", icon: "textures/items/flesh_bundle" },
    { item: "minecraft:pufferfish", count: 2, name: "Kugelfisch", icon: "textures/items/fish_pufferfish_raw" },
    { item: "minecraft:glass_bottle", count: 1, name: "Glasflasche", icon: "textures/items/potion_bottle_empty" }
  ] },
  { id: "basic_flippers", title: "Einfache Flossen", effect: "10 Prozent schneller im Wasser.", ingredients: [
    { item: "minecraft:dried_kelp_block", count: 3, name: "Getrockneter Seetangblock", icon: "textures/blocks/dried_kelp_top" },
    { item: "minecraft:leather", count: 6, name: "Leder", icon: "textures/items/leather" }
  ] },
  { id: "diamond_flippers", title: "Diamantflossen", effect: "50 Prozent schneller im Wasser.", ingredients: [
    { item: "nautic:basic_flippers", count: 1, name: "Einfache Flossen", icon: "textures/items/basic_flippers" },
    { item: "minecraft:diamond_block", count: 1, name: "Diamantblock", icon: "textures/blocks/diamond_block" },
    { item: "minecraft:nautilus_shell", count: 2, name: "Nautilusschale", icon: "textures/items/nautilus" },
    { item: "minecraft:dried_kelp_block", count: 2, name: "Getrockneter Seetangblock", icon: "textures/blocks/dried_kelp_top" }
  ] },
  { id: "flesh_bundle", title: "Fleischb\xFCndel", effect: "Ergibt ein Fleischb\xFCndel.", ingredients: [
    { item: "minecraft:rotten_flesh", count: 9, name: "Verrottetes Fleisch", icon: "textures/items/rotten_flesh" }
  ] }
];

// src/domain/hud.ts
var HUD_MARKER = "[nautic-hud]";
function encodeHudStatus(status) {
  return status ? HUD_MARKER + status : "";
}

// src/runtime/main.ts
var GUIDE_ID = "nautic:explorer_guide";
var BASIC_FLIPPERS_ID = "nautic:basic_flippers";
var DIAMOND_FLIPPERS_ID = "nautic:diamond_flippers";
var BREATH_TICKS = 6e3;
var baselineWaterMovement = /* @__PURE__ */ new Map();
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
function formatTime(ticks) {
  const seconds = Math.max(0, Math.ceil(ticks / 20));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
function statusText(player) {
  const mode = getStatusMode(player);
  if (mode === "off") return "";
  const parts = [];
  const breath = player.getEffect("water_breathing");
  if (breath && breath.duration > 0) {
    parts.push(`${mode === "icons" ? "\u25CC" : "Wasseratmung"} ${formatTime(breath.duration)}`);
  }
  const tier = getFlipperTier(player);
  if (player.isInWater && tier !== "none") {
    parts.push(`${mode === "icons" ? "\u224B" : "Flossen"} +${tier === "diamond" ? 50 : 10}%`);
  }
  return parts.join(" \xA78\xB7\xA7r ");
}
function applyPotion(player) {
  const current = player.getEffect("water_breathing")?.duration ?? 0;
  player.addEffect("water_breathing", Math.max(current, BREATH_TICKS), {
    amplifier: 0,
    showParticles: false
  });
}
function getWaterMovementComponent(player) {
  return player.getComponent("minecraft:underwater_movement");
}
function updateFlipperSpeed(player) {
  const tier = getFlipperTier(player);
  const component = getWaterMovementComponent(player);
  if (!component) return;
  const key = player.id;
  const active = player.isInWater && tier !== "none";
  if (!active) {
    const previous = baselineWaterMovement.get(key);
    if (previous !== void 0) {
      component.setCurrentValue(previous);
      baselineWaterMovement.delete(key);
    }
    return;
  }
  if (!baselineWaterMovement.has(key)) baselineWaterMovement.set(key, component.currentValue);
  const base = baselineWaterMovement.get(key);
  component.setCurrentValue(base * (tier === "diamond" ? 1.5 : 1.1));
}
async function showGuide(player) {
  const form = new ActionFormData().title("Nautic Explorer").body("Dein kompaktes Handbuch f\xFCr die ersten Tauchg\xE4nge.").button("Trank der Tiefenatmung", "textures/items/deep_breath_potion").button("Einfache Flossen", "textures/items/basic_flippers").button("Diamantflossen", "textures/items/diamond_flippers").button("Fleischb\xFCndel", "textures/items/flesh_bundle").button("Statusanzeige einstellen");
  const result = await form.show(player);
  if (result.canceled) return;
  if (result.selection === 4) return showStatusSettings(player);
  const guide = GUIDE_RECIPES[result.selection];
  if (guide) await showRecipe(player, guide);
}
async function showRecipe(player, guide) {
  while (true) {
    const form = new ActionFormData().title(guide.title).body(`\xA7lWirkung\xA7r
${guide.effect}

\xA7lZutaten\xA7r
Je Zutat ein eigenes Feld an der Werkbank belegen.`);
    for (const ingredient of guide.ingredients) {
      form.button(`${ingredient.count} \xD7 ${ingredient.name}`, ingredient.icon);
    }
    form.button("Zur\xFCck");
    const result = await form.show(player);
    if (result.canceled) return;
    if (result.selection === guide.ingredients.length) return showGuide(player);
  }
}
async function showStatusSettings(player) {
  const form = new ActionFormData().title("Statusanzeige").body("W\xE4hle, wie die aktive Atemzeit und Flossengeschwindigkeit erscheinen sollen.").button("Symbole").button("Text").button("Aus");
  const result = await form.show(player);
  if (result.canceled) return;
  setStatusMode(player, ["icons", "text", "off"][result.selection]);
  player.sendMessage("\xA7bNautic Explorer\xA7r: Statusanzeige aktualisiert.");
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
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    updateFlipperSpeed(player);
    const status = statusText(player);
    if (status) player.onScreenDisplay.setActionBar(encodeHudStatus(status));
  }
}, 10);
