// Bedrock runtime entrypoint. The Bedrock runtime supplies these modules when the pack is loaded.
// @ts-nocheck
import { EquipmentSlot, EntityComponentTypes, system, world } from "@minecraft/server";
import { ActionFormData, CustomForm } from "@minecraft/server-ui";
import { GUIDE_RECIPES, populateRecipeForm } from "../domain/guide";
import { encodeHudStatus } from "../domain/hud";
import { MovementController } from "../domain/movement";
import { renderStatus } from "../domain/status";
import { TEXT_KEYS as K, translate } from "../domain/localization";

const POTION_ID = "nautic:deep_breath_potion";
const GUIDE_ID = "nautic:explorer_guide";
const BASIC_FLIPPERS_ID = "nautic:basic_flippers";
const DIAMOND_FLIPPERS_ID = "nautic:diamond_flippers";
const BREATH_TICKS = 6000;
const movementController = new MovementController();

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
    isInWater: player.isInWater,
  });
}

function applyPotion(player) {
  const current = player.getEffect("water_breathing")?.duration ?? 0;
  player.addEffect("water_breathing", Math.max(current, BREATH_TICKS), {
    amplifier: 0,
    showParticles: false,
  });
}

function updateFlipperSpeed(player) {
  movementController.update(player.id, player.getComponent("minecraft:movement"), player.isInWater, getFlipperTier(player));
}

async function showGuide(player) {
  const form = new ActionFormData()
    .title("Nautic Explorer")
    .body(translate(K.intro))
    .button(translate(K.potion), "textures/items/deep_breath_potion")
    .button(translate(K.basicFlippers), "textures/items/basic_flippers")
    .button(translate(K.diamondFlippers), "textures/items/diamond_flippers")
    .button(translate(K.fleshBundle), "textures/items/flesh_bundle")
    .button(translate(K.settings));
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
  form.button(translate(K.back), () => { goBack = true; form.close(); });
  await form.show();
  if (goBack) await showGuide(player);
}

async function showStatusSettings(player) {
  const form = new ActionFormData()
    .title(translate(K.settings))
    .body(translate(K.settingsDescription))
    .button(translate(K.icons))
    .button(translate(K.text))
    .button(translate(K.off));
  const result = await form.show(player);
  if (result.canceled) return;
  setStatusMode(player, ["icons", "text", "off"][result.selection]);
  player.sendMessage({ rawtext: [{ text: "§bNautic Explorer§r: " }, translate(K.settingsUpdated)] });
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
