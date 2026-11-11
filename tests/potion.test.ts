import { formatRemainingTime, mergeWaterBreathingDuration, WATER_BREATHING_DURATION_TICKS } from "../src/domain/potion";

describe("deep breath potion", () => {
  it("lasts exactly five minutes", () => {
    expect(WATER_BREATHING_DURATION_TICKS).toBe(6000);
  });

  it("does not shorten a longer active effect", () => {
    expect(mergeWaterBreathingDuration(7000)).toBe(7000);
    expect(mergeWaterBreathingDuration(10)).toBe(6000);
  });

  it("formats remaining time as minutes and seconds", () => {
    expect(formatRemainingTime(6000)).toBe("5:00");
    expect(formatRemainingTime(599)).toBe("0:30");
    expect(formatRemainingTime(0)).toBe("0:00");
  });
});
