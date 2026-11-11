// Bedrock runtime entrypoint. The Bedrock runtime supplies these modules when the pack is loaded.
// @ts-nocheck
import { EquipmentSlot, EntityComponentTypes, system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const POTION_ID = "nautic:deep_breath_potion";
const GUIDE_ID = "nautic:explorer_guide";
const BASIC_FLIPPERS_ID = "nautic:basic_flippers";
const DIAMOND_FLIPPERS_ID = "nautic:diamond_flippers";
const BREATH_TICKS = 6000;
const baselineWaterMovement = new Map();

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
    parts.push(`${mode === "icons" ? "◌" : "Wasseratmung"} ${formatTime(breath.duration)}`);
  }
  const tier = getFlipperTier(player);
  if (player.isInWater && tier !== "none") {
    parts.push(`${mode === "icons" ? "≋" : "Flossen"} +${tier === "diamond" ? 50 : 10}%`);
  }
  return parts.join(" §8·§r ");
}

function applyPotion(player) {
  const current = player.getEffect("water_breathing")?.duration ?? 0;
  player.addEffect("water_breathing", Math.max(current, BREATH_TICKS), {
    amplifier: 0,
    showParticles: false,
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
    if (previous !== undefined) {
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
  const form = new ActionFormData()
    .title("Nautic Explorer")
    .body("Dein kompaktes Handbuch für die ersten Tauchgänge.")
    .button("Trank der Tiefenatmung", "textures/items/deep_breath_potion")
    .button("Einfache Flossen", "textures/items/basic_flippers")
    .button("Diamantflossen", "textures/items/diamond_flippers")
    .button("Fleischbündel", "textures/items/flesh_bundle")
    .button("Statusanzeige einstellen");
  const result = await form.show(player);
  if (result.canceled) return;
  if (result.selection === 4) return showStatusSettings(player);
  const details = [
    "2 Fleischbündel + 2 Kugelfische + 1 Glasflasche\n5 Minuten Wasseratmung.",
    "3 getrocknete Seetangblöcke + 6 Leder\nDauerhaft 10 % schneller im Wasser.",
    "Einfache Flossen + 1 Diamantblock + 2 Nautilusschalen + 2 getrocknete Seetangblöcke\nDauerhaft 50 % schneller im Wasser.",
    "9 verrottetes Fleisch\nErgibt ein Fleischbündel.",
  ];
  await new ActionFormData().title("Rezept").body(details[result.selection]).button("Zurück").show(player);
}

async function showStatusSettings(player) {
  const form = new ActionFormData()
    .title("Statusanzeige")
    .body("Wähle, wie die aktive Atemzeit und Flossengeschwindigkeit erscheinen sollen.")
    .button("Symbole")
    .button("Text")
    .button("Aus");
  const result = await form.show(player);
  if (result.canceled) return;
  setStatusMode(player, ["icons", "text", "off"][result.selection]);
  player.sendMessage("§bNautic Explorer§r: Statusanzeige aktualisiert.");
}

system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent("nautic:deep_breath_consume", {
    onConsume(event) {
      if (event.source?.typeId === "minecraft:player") applyPotion(event.source);
    },
  });
});

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  if (source?.typeId !== "minecraft:player") return;
  if (itemStack.typeId === GUIDE_ID) showGuide(source).catch(() => undefined);
});

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    updateFlipperSpeed(player);
    player.onScreenDisplay.setActionBar(statusText(player));
  }
}, 10);
