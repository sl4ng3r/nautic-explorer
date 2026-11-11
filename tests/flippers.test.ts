import { multiplierForTier, scaleWaterSpeed, tierForItemId } from "../src/domain/flippers";

describe("flippers", () => {
  it("uses mutually exclusive tiers", () => {
    expect(tierForItemId("nautic:basic_flippers")).toBe("basic");
    expect(tierForItemId("nautic:diamond_flippers")).toBe("diamond");
    expect(tierForItemId("minecraft:leather_boots")).toBe("none");
  });

  it("applies twenty and two hundred percent underwater multipliers", () => {
    expect(multiplierForTier("basic")).toBeCloseTo(1.2);
    expect(multiplierForTier("diamond")).toBeCloseTo(3);
    expect(scaleWaterSpeed(0.1, "diamond")).toBeCloseTo(0.3);
  });
});
