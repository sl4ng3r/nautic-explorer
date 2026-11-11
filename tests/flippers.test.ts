import { tierForItemId } from "../src/domain/flippers";

describe("flippers", () => {
  it("uses mutually exclusive tiers", () => {
    expect(tierForItemId("nautic:basic_flippers")).toBe("basic");
    expect(tierForItemId("nautic:diamond_flippers")).toBe("diamond");
    expect(tierForItemId("minecraft:leather_boots")).toBe("none");
  });

});
