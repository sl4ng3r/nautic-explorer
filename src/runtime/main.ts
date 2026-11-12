// Bedrock runtime entrypoint. The Bedrock runtime supplies these modules when the pack is loaded.
// @ts-nocheck
import { EquipmentSlot, EntityComponentTypes, system, world } from "@minecraft/server";
import { ActionFormData, CustomForm } from "@minecraft/server-ui";
import { GUIDE_RECIPES, populateRecipeForm } from "../domain/guide";
import { encodeHudStatus } from "../domain/hud";
import { SwimProbe, horizontalSpeedBetween } from "../domain/swim-probe";
import { swimImpulse } from "../domain/movement";
import { renderStatus } from "../domain/status";
import { TEXT_KEYS as K, translate } from "../domain/localization";

const POTION_ID = "nautic:deep_breath_potion";
const GUIDE_ID = "nautic:explorer_guide";
const BASIC_FLIPPERS_ID = "nautic:basic_flippers";
const DIAMOND_FLIPPERS_ID = "nautic:diamond_flippers";
const BREATH_TICKS = 6000;
const impulseDiagnostics = new Map();
const swimProbes = new Map();
const swimHud = new Map();

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
  if (system.currentTick % 5 !== 0 || impulseDiagnostics.get(player.id)?.error) return;
  try {
    const tier = getFlipperTier(player);
    if (!player.isInWater || tier === "none") {
      impulseDiagnostics.set(player.id, { active: false });
      return;
    }
    const impulse = swimImpulse({
      inWater: true, tier,
      forward: player.inputInfo.getMovementVector().y,
      view: player.getViewDirection(), velocity: player.getVelocity(),
      isRiding: !!player.getComponent("minecraft:riding")?.entityRidingOn,
    });
    if (!impulse) { impulseDiagnostics.set(player.id, { active: false }); return; }
    player.applyImpulse(impulse);
    impulseDiagnostics.set(player.id, { active: true });
  } catch (error) {
    impulseDiagnostics.set(player.id, { active: false, error: String(error) });
    player.sendMessage("Nautic Explorer: swim boost unavailable for this session.");
    console.warn(`Nautic Explorer swim boost: ${String(error)}`);
  }
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

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  impulseDiagnostics.delete(playerId);
  swimProbes.delete(playerId);
  swimHud.delete(playerId);
});

// Developer-only diagnostic; /scriptevent requires operator permissions and cheats.
system.afterEvents.scriptEventReceive.subscribe(({ id, message, sourceEntity: player }) => {
  if (id !== "nautic:swim_probe" || player?.typeId !== "minecraft:player") return;
  if (message === "stop") { swimProbes.delete(player.id); swimHud.delete(player.id); return; }
  if (message === "hud") {
    if (swimHud.has(player.id)) swimHud.delete(player.id);
    else swimHud.set(player.id, undefined);
    player.sendMessage("[Nautic probe] Live speed HUD " + (swimHud.has(player.id) ? "ON" : "OFF"));
    return;
  }
  if (message !== "start") return;
  swimHud.set(player.id, undefined);
  swimProbes.set(player.id, { probe: new SwimProbe(), start: system.currentTick + 60, wallStart: undefined });
  player.sendMessage("[Nautic probe 0.1.12] Starts in 3 seconds; swim straight for 10 seconds. Keep the same flippers and stay underwater. Result follows in chat.");
});

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const run = swimProbes.get(player.id);
    const component = run ? player.getComponent("minecraft:movement") : undefined;
    updateFlipperSpeed(player);
    if (!run || system.currentTick < run.start) continue;
    try {
      if (run.wallStart === undefined) run.wallStart = Date.now();
      const state = impulseDiagnostics.get(player.id);
      const tier = getFlipperTier(player);
      run.probe.record({ tick: system.currentTick, position: { ...player.location }, dimension: player.dimension.id,
        inWater: player.isInWater, swimming: player.isSwimming, sprinting: player.isSprinting,
        tier, movement: component?.currentValue,
        boostActive: state?.active ?? false, boostError: !!state?.error });
      if (system.currentTick >= run.start + 200) {
        const report = { ...run.probe.result(), wallSeconds: (Date.now() - run.wallStart) / 1000 };
        player.sendMessage("[Nautic probe 0.1.12] " + JSON.stringify(report));
        swimProbes.delete(player.id);
      }
    } catch (error) {
      swimProbes.delete(player.id);
      player.sendMessage("[Nautic probe] Aborted: " + String(error));
    }
  }
}, 1);

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const status = statusText(player);
    if (swimHud.has(player.id)) {
      const now = { tick: system.currentTick, position: { ...player.location }, dimension: player.dimension.id };
      const previous = swimHud.get(player.id);
      const speed = previous ? horizontalSpeedBetween(previous, now) : undefined;
      swimHud.set(player.id, now);
      const state = impulseDiagnostics.get(player.id);
      const component = player.getComponent("minecraft:movement");
      const number = value => value === undefined ? "-" : value.toFixed(3);
      const debug = `Speed ${speed === undefined ? "-" : speed.toFixed(2)} blocks/s (tick)\nSwim ${Number(player.isSwimming)} Sprint ${Number(player.isSprinting)} Boost ${Number(state?.active ?? false)}\nAttr ${number(component?.currentValue)} Error ${Number(!!state?.error)}`;
      player.onScreenDisplay.setActionBar(encodeHudStatus({ rawtext: [{ text: debug + (status ? "\n" : "") }, ...(status?.rawtext ?? [])] }));
    } else if (status) player.onScreenDisplay.setActionBar(encodeHudStatus(status));
  }
}, 10);
