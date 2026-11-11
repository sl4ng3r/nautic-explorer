import { renderStatus } from "../src/domain/status";

describe("status bar", () => {
  it("shows remaining breathing time and active flipper bonus", () => {
    expect(renderStatus({ mode: "text", waterBreathingTicks: 6000, flipperTier: "diamond", isInWater: true }))
      .toContain("Wasseratmung 5:00");
    expect(renderStatus({ mode: "text", waterBreathingTicks: 6000, flipperTier: "diamond", isInWater: true }))
      .toContain("Flossen +50%");
  });

  it("hides the flipper bonus on land", () => {
    expect(renderStatus({ mode: "text", waterBreathingTicks: 0, flipperTier: "basic", isInWater: false })).toBe("");
  });

  it("supports an explicit off mode", () => {
    expect(renderStatus({ mode: "off", waterBreathingTicks: 6000, flipperTier: "diamond", isInWater: true })).toBe("");
  });
});
